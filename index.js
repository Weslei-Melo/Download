const fs = require('fs');
const path = require('path');
const https = require('https');
const pdf = require('pdf-parse');

const downloadPath = path.resolve(__dirname);

async function downloadPdf() {
  const options = {
    hostname: "dejt.jt.jus.br",
    port: 443,
    path: "/cadernos/Diario_J_15.pdf",
    method: "GET",
    rejectUnauthorized: false,
  };

  let file = fs.createWriteStream(`${downloadPath}/test.pdf`);

  try {
    const req = https.request(options, (res) => {
      console.log("statusCode:", res.statusCode);
      console.log("headers:", res.headers);

      res.on("data", async (d) => {
        //process.stdout.write(d);
      });
      res.pipe(file);
    });

    req.on("error", (e) => {
      console.error(e);
    });

    req.end();

  } catch (err) {
    console.log(err);
  }
}

async function readPdf() {
  let dataBuffer = fs.readFileSync(`${downloadPath}/test.pdf`);
  try {
    await pdf(dataBuffer).then(async (data) => {
      // fs.writeFile(`${downloadPath}/example.txt`, data.text, function (erro) {
      //   if (erro) {
      //     throw erro;
      //   }
      //   console.log("Arquivo salvo");
      // });
      let string = data.text;
      let conteudo1_processo;
      let conteudo2_processo;
      let advogado="OAB: 58246/SP";
      let posicao;
      let posicao2;
      let vetor_localiza_advogado=[];
      let pos_advogado = 0;
      var vetor_publicacoes=[];

      while ( pos_advogado != -1 ) {
        pos_advogado = string.indexOf(advogado ,pos_advogado + 1 );

        if(pos_advogado!=-1){
          vetor_localiza_advogado.push(pos_advogado);
        }
      }
      // for (let i = 0; i < vetor_localiza_advogado.length; i++) {
      //   console.log(vetor_localiza_advogado[i],"   ");
      // }
      console.log( vetor_localiza_advogado.length, "processo(s) publicado(s)");

        for (var j = 0; j < vetor_localiza_advogado.length; j++) {
          posicao=string.indexOf("Processo Nº",vetor_localiza_advogado[j]-500);
          posicao2=vetor_localiza_advogado[j];
         
          if(posicao2 ===-1 || posicao2===-1){
            break;
          }
          conteudo1_processo=string.substring(posicao,posicao2);
          
          // console.log("INICIO:",posicao," FIM: ",posicao2);
          // console.log("Posição 1: ",posicao, "Posição 2: ",posicao2);
          // console.log(conteudo_processo);
          
          posicao =vetor_localiza_advogado[j];
          posicao2= string.indexOf("Processo Nº",posicao);
          if(posicao2===-1){
            posicao2= string.indexOf("SUMÁRIO",posicao);
          }
          if(posicao2 ===-1 || posicao2===-1){
            break;
          }
        
          console.log("Posição 1: ",posicao, "Posição 2: ",posicao2);
          conteudo2_processo=string.substring(posicao,posicao2-1);
          let conteudo3_processo= conteudo1_processo.concat(conteudo2_processo);

          vetor_publicacoes.push(conteudo3_processo);

        }  

        for(let i = 0; i < vetor_publicacoes.length; i++){
          console.log("Publicação: ",i+1);
         
          
          let x=vetor_publicacoes[i].indexOf("Código para aferir");
          

          if(x!=-1){
            vetor_publicacoes[i]=Remove(vetor_publicacoes[i],x,173);
          }
          // Código para aferir autenticidade deste caderno: 152591
          // 3000/2020
          // Tribunal Regional do Trabalho da 15ª Região3
          // Data da Disponibilização: Terça-feira, 23 de Junho de 2020

          vetor_publicacoes[i] = put_space(vetor_publicacoes[i]);

           console.log(vetor_publicacoes[i]);

          console.log("//////////////////////////////////////////////////////////////////////////////////////////////////////////");
        }


       

    });
  } catch (err) {
    console.log(err);
  }
}




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

function Remove(str, startIndex, count) {
  return str.substr(0, startIndex) + str.substr(startIndex + count);
}

(async () => {
//   //await downloadPdf();
  await readPdf();
})();
