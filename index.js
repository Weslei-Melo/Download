const fs = require('fs');
const path = require('path');
const https = require('https');
const pdf = require('pdf-parse');

const downloadPath = path.resolve(__dirname);

function downloadPdf() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "dejt.jt.jus.br",
      port: 443,
      path: "/cadernos/Diario_J_15.pdf",
      method: "GET",
      rejectUnauthorized: false,
    };

    let file = fs.createWriteStream(`${downloadPath}/test.pdf`);
    const req = https.request(options, (res) => {
      console.log("statusCode:", res.statusCode);
      console.log("headers:", res.headers);

      res.pipe(file);

      res.on("end", () => {
        resolve(true);
      });
    });

    req.on("error", (err) => {
      console.log(err);
      reject(false);
    });
    req.end();
  });
}

async function readPdf() {
  let dataBuffer = fs.readFileSync(`${downloadPath}/test.pdf`);
  try {
      await pdf(dataBuffer).then(async (data) => {
          // //gerar arquivo .txt com os dados do pdf
          // fs.writeFile(`${downloadPath}/example.txt`, data.text, function (erro) {
          //   if (erro) {
          //     throw erro;
          //   }
          //   console.log("Arquivo salvo");
          // });

          let string = data.text;
          let conteudo1_processo;
          let conteudo2_processo;
          let advogado="OAB: 25027/SP";
          let posicao;
          let posicao2;
          let pos_final_advogado=0;
          let vetor_localiza_advogado=[];
          let vetor_localiza_advogado_final=[];
          let pos_advogado = 0;
          var vetor_publicacoes=[];

          // encntrar todos locais onde foi citado a variavel "advogado"
          while ( pos_advogado != -1 ) {
              pos_advogado = string.indexOf(advogado ,pos_advogado + 1 );
              pos_final_advogado=string.indexOf("Processo Nº" ,pos_advogado + 1 );

              //vereficar se em um publicação(Processo) aparece a varial advogado mais de uma vez (repetidos)
              if(pos_advogado!=-1){
                  
                  let repetido=0;

                  for(let i=0; i< vetor_localiza_advogado_final.length ;i++){
                      if(vetor_localiza_advogado_final[i] == pos_final_advogado){
                          repetido=1;
                          break;
                      }
                  }

                  if(repetido == 0){
                      vetor_localiza_advogado_final.push(pos_final_advogado);
                      vetor_localiza_advogado.push(pos_advogado);
                      // console.log("Posição 1: ",pos_advogado, "Posição 2: ",pos_final_advogado);
                  }
              }
          }

            console.log("Tamanho do vetor_localiza_advogado: ",vetor_localiza_advogado.length);
          for (var j = 0; j < vetor_localiza_advogado.length; j++) {
              //preciso melhorar essa parte
              posicao=string.indexOf("Processo Nº",vetor_localiza_advogado[j]-500);
              posicao2=vetor_localiza_advogado[j];
              
              if(posicao ===-1 ){
                  break;
              }
              conteudo1_processo=string.substring(posicao,posicao2);

              posicao =vetor_localiza_advogado[j];
              posicao2= string.indexOf("Processo Nº",posicao);
              //pode ser o ultimo processo do pdf, precisa melhorar
              if(posicao2===-1){
                  posicao2= string.indexOf("SUMÁRIO",posicao);
              }
              if(posicao2 ===-1 || posicao2===-1){
                  break;
              }
              
              
              conteudo2_processo=string.substring(posicao,posicao2-1);

              vetor_publicacoes.push(conteudo1_processo.concat(conteudo2_processo));
          
          }

          //Quantas citações teve 
          console.log( vetor_publicacoes.length, "processo(s) publicado(s)");
        

          var ano= new  Date();
          ano=ano.getFullYear();
          string_ano="de ".concat(ano);
          console.log(string_ano);

          for(let i = 0; i < vetor_publicacoes.length; i++){
              console.log("Publicação: ",i+1);
              
              //remove a parte do rodapé
              let x=0;
              let y =0;
              //se uma publicação estiver em mais de 1 página
              while(x!=-1){
                  x=vetor_publicacoes[i].indexOf("Código para aferir autenticidade deste caderno",x);
                  y=vetor_publicacoes[i].indexOf(string_ano,x);
                  if(x!=-1){
                      let str1=vetor_publicacoes[i].substring(0,x);
                      let str2= vetor_publicacoes[i].substring(y+8);
                      vetor_publicacoes[i]=str1.concat(str2);
                  }
              }
              //coloca espaços entre palavras que estão unidas
              vetor_publicacoes[i] = put_space(vetor_publicacoes[i]);
              console.log(vetor_publicacoes[i]);
              console.log("//////////////////////////////////////////////////////////////////////////////////////////////////////////");
          }
          

      });
  } catch (err) {
    console.log(err);
  }
}

//Função para colocar espaços entre algumas palavras que ficaram juntas
function put_space(string){
  let str= string;
  string=string.replace(eval('/'+"AUTOR"+'/g'),"AUTOR ");
  string=string.replace(eval('/'+"TESTEMUNHA"+'/g'),"TESTEMUNHA ");
  string=string.replace(eval('/'+"RÉU"+'/g'),"RÉU ");
  string=string.replace(eval('/'+"ADVOGADO"+'/g'),"ADVOGADO ");
  string=string.replace(eval('/'+"PERITO"+'/g'),"PERITO ");
  string=string.replace(eval('/'+"RECORRENTE"+'/g'),"RECORRENTE ");
  string=string.replace(eval('/'+"RECORRIDO"+'/g'),"RECORRIDO ");
  string=string.replace(eval('/'+"Revisor"+'/g'),"Revisor ");
  string=string.replace(eval('/'+"Relator"+'/g'),"Relator ");
  string=string.replace(eval('/'+"Complemento"+'/g'),"Complemento ");
  return (string);
}

//Função para remover a parte do rodapé da pagina quando um processo ocupada mais de uma pagina
function Remove(str, startIndex, count) {
  return str.substr(0, startIndex) + str.substr(startIndex + count);
}

(async () => {
  let verify = await downloadPdf();
  if (verify) readPdf();
  else console.log("Não conseguiu fazer o download do pdf");
  readPdf();
})();