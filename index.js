var firebaseConfig = {
    apiKey: "AIzaSyBfEIhdLn0la1wQ9Xr8bLchCs8jKZX_u5A",
    authDomain: "sistemalivraria-44486.firebaseapp.com",
    databaseURL: "https://sistemalivraria-44486-default-rtdb.firebaseio.com",
    projectId: "sistemalivraria-44486",
    storageBucket: "sistemalivraria-44486.appspot.com",
    messagingSenderId: "922766945547",
    appId: "1:922766945547:web:cfb8d0f42dc49e6844460e",
    measurementId: "G-2WMQSXRK1Y"
  };

  // Initialize Firebase
  var firebase = require("firebase")
  firebase.initializeApp(firebaseConfig);
  let listaDB = []//array externo de itens para serem salvos no BD.
  let listaItens = []; // array externo de itens para a tabela de compras.
  let valorTotal = 0;
  function SalvarDB(x){  
    for(i=0;i<listaDB.length;i++){
      if(i ==listaDB.length-1){
        x.set({
          nome: array[i][1],
          quantidade: array[i][2],
          valor: array[i][3]
      })}else{
         x.set({
          nome: array[i][1],
          quantidade: array[i][2],
          valor: array[i][3],})
      }
    }
  }
  function apagarRastros(){
    localizador =ref.child("Vendas").orderByChild("vendaEfetuada").equalTo("ultimavenda")
    localizador.update({ vendaEfetuada: null});
    for (let i = listaDB.length; i > 0; i--) {
      listaDB.pop();
      listaItens.pop();
    }
  }

  let express = require("express");
  let handlebars = require("express-handlebars")
  var ref = firebase.database().ref();
  let session = require('express-session')//Autenticação e Autorização
  let flash = require('connect-flash');

  let app = express(); // cria um servidor

  const { response } = require("express");
  //configurando Handlebars
  app.listen(8001,()=>{console.log("Ouvindo porta 8001");});

  app.engine("handlebars", handlebars({defaultLayout: "main"}));
  app.set("view engine", "handlebars");

  //configurações dp body parser
  app.use(express.urlencoded({extended:false}));
  app.use(express.json());
  //configurações do flash(sistema de mensagens)
  app.use(flash());
  //configurações de sessão
  app.set('trust proxy', 1) // configura proxy trust first para servidor atrás de proxy
  app.use(session({
    secret: 'MyBook-ADS-LF', // escolha nome diferente, único
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 300000}
  }));
  //midleware - só pode ser usado dentro de sessão
  app.use((req, res, next) => {
    res.locals.sucesso = req.flash("successo");
    res.locals.erro = req.flash("erro");
    next();
  });
  //Definindo Rotas

    app.get("/",(req, res)=>{
      
      if(req.session.user){
        res.render("menu",{
          user: "Usuário Logado:"+req.session.user
        });
      }else{
        res.render("menu",{
          user: "Usuário desconectado",
          btnVendas: "disabled"
        });
      }

      
    });

    app.get("/Produtos",(req, res)=>{
      res.render("produtosMenu")
    });

    app.get("/Pesquisa/Promoção",(req, res)=>{
      
    });

    app.get("/Pesquisa/Avançada",(req, res)=>{
      
    });

    app.get("/Pesquisa/Busca",(req, res)=>{
      let busca = req.query.busca;
      console.log(busca);
      let end = (busca+"\uf8ff");
      console.log(end);
      let refPesquisa = ref.child("Pesquisa/Id");
      let referencia = refPesquisa.orderByChild('nome').startAt(busca).endAt(end);
      res.writeHead(200, {"Content-Type": "text/html; charset=UTF-8"});
      referencia.once("value", function(snapshot) {
          html = "";
          snapshot.forEach(function(childSnapshot){
              var nome = (childSnapshot.val().nome)
              var autor = (childSnapshot.val().autor)
              var categoria = (childSnapshot.val().categoria)
              var valor = (childSnapshot.val().valor)
              var desconto = (childSnapshot.val().desconto)
              var descrição = (childSnapshot.val().descrição)
              console.log(nome);
              console.log(autor);
              console.log(categoria);
              console.log(valor);
              console.log(desconto);
              console.log(descrição);
              html+="<hr>"
              html+="<p> <b>nome:</b> " +nome+"</p>";
              html+="<p> <b>autor:</b> " +autor+"</p>";
              html+="<p> <b>categorias:</b> " +categoria+"</p>";
              html+="<p> <b>valor:</b> " +valor+" R$</p>";
              html+="<p> <b>desconto:</b> " +desconto+" %</p>";
              html+="<p> <b>descrição</b><br> " +descrição+"</p>";
              
          });
          res.write("<html><head></head><body>");
          res.write("<a href='/Produtos'><button name='btnVoltar'>Voltar</button></a>")
          res.write("<h1>Buscando por:"+busca+"</h1>");
          res.write(html+"</body></html>")
          res.end();
      });
    });

    app.get("/Pesquisa/Livros",(req, res)=>{
      
    });
    app.get("/Vendas",(req, res)=>{
      if (!req.session.user) {
        res.render("loginFuncionario");
      }
      res.render("listaCompras", {
        listaItens: listaItens,
        user: req.session.user,
        valorTotal: valorTotal});
    });

    app.get("/Vendas/Add",(req, res)=>{
      if (!req.session.user) {
        res.render("loginFuncionario");
      }
      let itemDB = [];
      let item = [];
      let erros = [];

      if (!req.query.quantidade || req.query.quantidade == undefined || req.query.quantidade == null) {
          erros.push({texto: "Defina uma quantidade"});
      };
      if (!req.query.produto || req.query.produto == undefined || req.query.produto == null) {
          erros.push({texto: "Nome Vazio"});
      };
      if(erros.length > 0) {
          res.render("listaCompras", {erros: erros, user: req.session.user});
          return;
      }

      let produto = req.query.produto;
      let quantidade = req.query.quantidade;
      let refProduto = ref.child("Pesquisa/Id");
      let nomeCliente  = req.query.nomeCliente;
      let cpfCliente  = req.query.cpfCliente;
      let data  = req.query.data;
      let refValor = refProduto.orderByChild("nome").equalTo(produto);
      
      refValor.once("child_added",function(snapshot){
        let valor = (snapshot.val().valor)
        console.log(valor)
        let valorNumerico = (parseFloat(valor)*parseFloat(quantidade)).toFixed(2)
        valorTotal += parseFloat(valorNumerico);
        itemDB.push(produto, quantidade, valorNumerico);
        listaDB.push(itemDB);
        item.push({dado: produto}, {dado: quantidade}, {dado: valorNumerico});
        listaItens.push({item: item});
        res.render("listaCompras", {
          listaItens: listaItens,
          user: req.session.user,
          valorTotal: valorTotal.toFixed(2),
          nomeCliente: nomeCliente,
          cpfCliente: cpfCliente,
          data: data});
      });
        
      
    });
    app.get("/Vendas/Finalizar",(req, res)=>{
      let refVendas = ref.child("Vendas").push();//Inicia uma nova "vendaXX".
      let nomeCliente  = req.query.nomeCliente;
      let cpfCliente  = req.query.cpfCliente;
      let data  = req.query.data;
      refVendas.set({
        cpfCliente: cpfCliente,
        nomeCliente: nomeCliente,
        data: data,
        vendedor: req.session.user,
        valorTotal: "R$"+valorTotal.toFixed(2),
        vendaEfetuada: "ultimavenda"})
      refVendaEfetuada = ref.child("Vendas").orderByChild("vendaEfetuada").equalTo("ultimavenda").push()
      SalvarDB(refVendaEfetuada);
      apagarRastros();
      res.render("vendafinalizada");

    })
    

    app.get("/Login",(req, res)=>{
      res.render("loginFuncionario");
    });

    app.post("/Login/Conf",(req,res)=>{

      let erros = [];

      if (!req.body.usuarioF || req.body.usuarioF ==  undefined || req.body.usuarioF == null) {
          erros.push({texto: "Nome vazio"});
      };
      if (!req.body.senhaF || req.body.senhaF ==  undefined || req.body.senhaF == null)  {
          erros.push({texto: "Senha vazia"});
      }
      if(erros.length > 0) {
          res.render("loginFuncionario", {erros: erros});
      }
      
      let login = req.body.usuarioF;
      let senha = req.body.senhaF;
      console.log(login);
      let refLogin = ref.child("Login/Cadastro").orderByChild('usuario').equalTo(login);
      refLogin.once("child_added", function(snapshot) {
        console.log(snapshot.key + "<- Chave -- Valor-> "+ snapshot.val());
        console.log(snapshot.val().usuario);
        if (snapshot.val().usuario.toLowerCase() == login.toLowerCase()) {
            if (snapshot.val().senha == senha) {
                req.session.user = login;
                res.render("menu", {user: "Usuário Logado:"+req.session.user});
            } else {
                erros.push({texto: "Senha ou usuário inválida"});
                res.render("loginFuncionario", {erros: erros});
            }
        }else{
          erros.push({texto: "Senha ou usuário inválida"});
          res.render("loginFuncionario", {erros: erros});
        }
      })
    })
    app.get("/Login/Registrar",(req, res)=>{
      
      res.render("registrarFuncionario");
    });

    app.post("/Login/RegistarConf",(req, res)=>{
      
      let erros = [];
      var refUser = ref.child("Login/Cadastro").orderByChild("usuario").equalTo(req.body.usuarioF)
      if (!req.body.nomeF || req.body.nomeF ==  undefined || req.body.nomeF == null) {
        erros.push({texto: "Nome vazio"});
      }
      if (!req.body.matriculaF || req.body.matriculaF ==  undefined || req.body.matriculaF == null) {
        erros.push({texto: "Matricula vazia"});
      }
      if (!req.body.emailF || req.body.emailF ==  undefined || req.body.emailF == null) {
        erros.push({texto: "Email vazio"});
      }
      if (!req.body.usuarioF || req.body.usuarioF ==  undefined || req.body.usuarioF == null) {
        erros.push({texto: "Usuario vazio"});
      }else{
         refUser.once("child_added", function(snapshot)  {
          if (snapshot.exists()){
            const userData = (snapshot.val().usuario);
            console.log("exists! "+ userData);
            if(req.body.usuarioF == userData){
              console.log("é igual")
              erros.push({texto: "Usuário já cadastrado"});
            }
          }
        });
        console.log ("X")
      }
      if (!req.body.senhaF || req.body.senhaF ==  undefined || req.body.senhaF == null) {
      erros.push({texto: "Senha vazia"});
      }
      if (!req.body.repetirF || req.body.repetirF ==  undefined || req.body.repetirF == null|| req.body.repetirF!=req.body.senhaF)  {
      erros.push({texto: "Repetir senha não valido"});
      }
      if(erros.length > 0) {
        res.render("registrarFuncionario", {erros: erros});
        return;
      }else{
        let nome = req.body.nomeF;
      let sobrenome = req.body.sobreF;
      let usuario = req.body.usuarioF;
      let matricula = req.body.matriculaF;
      let email = req.body.emailF;
      let senha = req.body.senhaF;
      let repetirSenha = req.body.repetirF;
      let loja = req.body.lojaF;

      refCadastro = ref.child("Login/Cadastro").push();
      refCadastro.set({
        email: email,
        loja: loja,
        matricula: matricula,
        nome: nome,
        repetirSenha: repetirSenha,
        senha: senha,
        sobrenome: sobrenome,
        usuario: usuario
      });// gravando dados.

      //enviando a resposta
      res.render("formRF",{
        email: email,
        loja: loja,
        matricula: matricula,
        nome: nome,
        sobrenome: sobrenome,
        usuario: usuario});
      }
      
    });

    app.get("/CadastroProduto",(req, res)=>{
      res.render("cadastroProdutos")
    });
    app.post("/CadastroProduto/Conf",(req, res)=>{
      
      let autor = req.body.autor;
      let categoria = req.body.categoria;
      let dLancamento = req.body.dLancamento;
      let descricao  = req.body.descricao;
      let disponibilidade  = req.body.disponibilidade;
      let isbn = req.body.isbn;
      let nome = req.body.nome;
      let valor = req.body.valor;
      let desconto = req.body.desconto;
      let quantidade = req.body.quantidade;

      refProduto = ref.child("Pesquisa/Id").push();
      refProduto.set({
        autor: autor,
        categoria: categoria,
        dLançamento: dLancamento,
        descrição: descricao,
        disponibilidade: disponibilidade,
        isbn: isbn,
        nome: nome,
        valor: valor,
        desconto: desconto, 
        quantidade: quantidade
      
      });// gravando dados.

      //enviando a resposta
      res.render("formCP",{
        autor: autor,
        categoria: categoria,
        dLançamento: dLancamento,
        descrição: descricao,
        disponibilidade: disponibilidade,
        isbn: isbn,
        nome: nome,
        valor: valor,
        desconto: desconto, 
        quantidade: quantidade});
    });
    app.post("/CadastroProduto/Consultar",(req,res)=>{
      let refConsulta = ref.child("Pesquisa/Id");
      let autor = req.body.autor;
      let categoria = req.body.categoria;
      let dLancamento = req.body.dLancamento;
      let descricao  = req.body.descricao;
      let disponibilidade  = req.body.disponibilidade;
      let isbn = req.body.isbn;
      let nome = req.body.nome;
      let valor = req.body.valor;
      let desconto = req.body.desconto;
      let quantidade = req.body.quantidade;

      pai = refConsulta.orderByChild('nome').equalTo(nome)
      pai.on("child_added", function(snapshot){
        console.log(snapshot.key + "<- Chave  Valor de valor-> "+ snapshot.val().valor + "R$");
      })
      pai.once("value", function(snapshot) {
        console.log()
        console.log(snapshot.val());
        res.send(snapshot.val());
      })
    })