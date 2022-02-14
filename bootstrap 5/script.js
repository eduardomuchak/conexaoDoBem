const botaoCadastrar = document.querySelector('.btn-success');
const botaoLimpar = document.querySelector('#botao-limpar');
const listaOngs = document.querySelector('.lista-ong');
const nomeDaOng = document.querySelector('#input-nome-ong');
const rua = document.querySelector('#input-endereco');
const numeroPredial = document.querySelector('#input-numero-predial');
const bairro = document.querySelector('#input-bairro');
const cidade = document.querySelector('#input-cidade');
const estado = document.querySelector('#input-estado');
const inputCep = document.querySelector('#input-CEP');

const botaoFiltrar = document.querySelector('.btn-filter')


let map;

function initMap() {
  map = new google.maps.Map(document.querySelector(".map"), {
    center: { lat: -15.212355602107472, lng: -52},
    zoom: 4.1,
  });
};

function limpa_formulário_cep() {
  //Limpa valores do formulário de cep.
  rua.value = '';
  bairro.value = '';
  cidade.value = '';
  estado.value = '';
};

function meu_callback(conteudo) {
  if (!("erro" in conteudo)) {
    //Atualiza os campos com os valores.
    rua.value = (conteudo.logradouro);
    bairro.value = (conteudo.bairro);
    cidade.value = (conteudo.localidade);
    estado.value = (conteudo.uf);
  } //end if.
  else {
    //CEP não Encontrado.
    limpa_formulário_cep();
    alert("CEP não encontrado.");
  }
};

function pesquisacep(valor) {
  //Nova variável "cep" somente com dígitos.
  let cep = valor.replace(/\D/g, '');

  //Verifica se campo cep possui valor informado.
  if (cep != "") {

    //Expressão regular para validar o CEP.
    let validacep = /^[0-9]{8}$/;

    //Valida o formato do CEP.
    if(validacep.test(cep)) {

        //Preenche os campos com "..." enquanto consulta webservice.
        rua.value = "...";
        bairro.value = "...";
        cidade.value = "...";
        estado.value = "...";

        //Cria um elemento javascript.
        let script = document.createElement('script');

        //Sincroniza com o callback.
        script.src = `https://viacep.com.br/ws/${cep}/json/?callback=meu_callback`;

        //Insere script no documento e carrega o conteúdo.
        document.body.appendChild(script);
        return true;

    } //end if.
    else {
        //cep é inválido.
        limpa_formulário_cep();
        alert("Formato de CEP inválido.");
        return false;
    }
  } //end if.
  else {
    //cep sem valor, limpa formulário.
    limpa_formulário_cep();
    return undefined;
  }
};

function getOngInfo() {
  const createLi = document.createElement('li');
  const createH5 = document.createElement('h5');
  const createSpan = document.createElement('span');

  const categoria = document.querySelector('input[name="categoria"]:checked');
  createLi.classList.add(estado.value);
  createLi.classList.add(categoria.value);

  createLi.appendChild(createH5);
  createLi.classList.add('list-group-item');
  createH5.innerHTML = `${nomeDaOng.value.toUpperCase()}`;
  createLi.appendChild(createSpan);
  createSpan.innerText = `ENDEREÇO: ${rua.value.toUpperCase()} - ${numeroPredial.value}, ${bairro.value.toUpperCase()} - ${cidade.value.toUpperCase()}/${estado.value.toUpperCase()}`;
  return createLi; 
};

async function appendOngList(event) {
  event.preventDefault();
  listaOngs.appendChild(getOngInfo()); 
  const location = (await teste(inputCep.value));
  const ponto = new google.maps.LatLng(location.latitute, location.longitude)
  const marker = new google.maps.Marker({
    position: ponto,//seta posição
    map: map,//Objeto mapa
    title: nomeDaOng.value
  });
};

botaoCadastrar.addEventListener('click', appendOngList);

function clearForm() {
  limpa_formulário_cep()
  nomeDaOng.value = '';
  inputCep.value = '';
  numeroPredial.value = '';
};
botaoLimpar.addEventListener('click', clearForm);

// FUNÇÕES DIGÃO

const saveOngs = (addedItem) => {
  localStorage.setItem('ongsSaved', addedItem);
};

function createElementP(valor) {
  const info = document.createElement('p');
  info.innerText = valor;
  return info 
}

function filterPerRegion() {
  const instituicoesListadas = [...listaOngs.children];
  const select = document.querySelector('#state-filter');
	const estado = select.options[select.selectedIndex].text;
  const select2 = document.querySelector('#category-filter');
	const categoria = select2.options[select2.selectedIndex].text;
  instituicoesListadas.forEach ((element) => {
    if (!element.classList.contains(estado) || !element.classList.contains(categoria)){
      element.classList.add('disappear')
    }
    if (element.classList.contains(estado) && element.classList.contains(categoria)){
      element.classList.remove('disappear')
    }
    if (estado === 'TODOS' && element.classList.contains(categoria)){
      element.classList.remove('disappear')
    }
    if (categoria === 'TODOS' && element.classList.contains(estado)){
      element.classList.remove('disappear')
    }
    if (estado === 'TODOS' && categoria === 'TODOS'){
      element.classList.remove('disappear')
    };
  });
};

const createDiv = async () => {
  const item = document.createElement('li');
  const categoria = document.querySelector('input[name="categoria"]:checked');
  item.classList.add(estado.value);
  item.classList.add(categoria.value);
  item.appendChild(createElementP(nomeDaOng.value));
  item.appendChild(createElementP(cidade.value));
  item.appendChild(createElementP(estado.value));
  item.appendChild(createElementP(categoria.value));
  listaOngs.appendChild(item);
  const location = (await teste(cep.value));
  const ponto = new google.maps.LatLng(location.latitute, location.longitude)
  const marker = new google.maps.Marker({
    position: ponto,//seta posição
    map: map,//Objeto mapa
    title: nomeDaOng.value
  });
};

botaoFiltrar.addEventListener('click', filterPerRegion);

const teste = async (cep) => {
  const location = await buscaLocalizacao(cep);
  const lat = location[0].geometry.location.lat;
  const lng = location[0].geometry.location.lng;
  return {latitute: lat, longitude: lng}
};

module.exports = pesquisacep;