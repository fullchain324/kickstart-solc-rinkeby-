const path =require('path');
const fs =require('fs-extra');
const solc=require('solc')

const buildPath = path.resolve(__dirname,'build')

const getSource=function(){
  const sourcepath = path.resolve(__dirname,'contracts','Campaign.sol')
  const data = fs.readFileSync(sourcepath,'utf-8')
  return data
}

const input ={
  language: 'Solidity',
  sources: {
    'Campaign.sol': {
      content: getSource()
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
}


const output=JSON.parse(solc.compile(JSON.stringify(input)))

function errorHandling(compiledSources) {
  if (!compiledSources) {
      console.error('>>>>>>>>>>>>>>>>>>>>>>>> ERRORS <<<<<<<<<<<<<<<<<<<<<<<<\n', 'NO OUTPUT');
  } else if (compiledSources.errors) { // something went wrong.
      console.error('>>>>>>>>>>>>>>>>>>>>>>>> ERRORS <<<<<<<<<<<<<<<<<<<<<<<<\n');
      compiledSources.errors.map(error => console.log(error.formattedMessage));
  }
}

function writeOutput(output,buildPath){
  fs.removeSync(buildPath);
  fs.ensureDirSync(buildPath);

  for(let contractName in output.contracts){
    for(let key in output.contracts[contractName]){

      fs.outputJSONSync(
        path.resolve(buildPath,`${key}.json`),
        output.contracts[contractName][key]
      )
    }
  }

  console.log('Build Successfly')
}


writeOutput(output,buildPath)
errorHandling(output)