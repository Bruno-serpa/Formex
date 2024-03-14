//-------------------- CNPJ ---------------------------------

const cnpj = document.getElementById('cnpj')

cnpj.addEventListener('keypress', () => {
    let cnpjlength = cnpj.value.length

    if(cnpjlength === 2 || cnpjlength === 6){
        cnpj.value += '.'
    }
    else if(cnpjlength === 10){
        cnpj.value += '/'
    }
    else if(cnpjlength === 15){
        cnpj.value += '-'
    }
})

//-------------------- CEP ---------------------------------

const cep = document.getElementById('cep')

cep.addEventListener('keypress', () => {
    let ceplength = cep.value.length

    if(ceplength === 5){
        cep.value += '-'
    }
})

//-------------------- FONE ---------------------------------

const fone = document.getElementById('fone')

fone.addEventListener('keypress', () => {
    let fonelength = fone.value.length

    if(fonelength === 0){
        fone.value += '('
    }
    else if(fonelength === 3){
        fone.value += ') '
    }
    else if(fonelength === 10){
        fone.value += '-'
    }
})