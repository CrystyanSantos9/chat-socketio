const supertest = require('supertest')
const session = require('supertest-session')
const { http, aplicarDesconto } = require('../src/app')

var testSession = null;

beforeEach(function () {
    testSession = session(http, {
        before: function(req){
            req.set({name: 'Teste'})
        }
    });
  });

test('GET /aplicarDesconto/10/5', async () => {
    const response = await supertest(http)
        .get('/aplicarDesconto/10/5');
 
    expect(response.statusCode).toEqual(200);
    expect(response.body.valorDescontado).toEqual(5);
})

test('Verificar se botão de input aparece na home', async () => {
    const response = await supertest(http)
        .get('/');       
    const buttonEntrar = response.res.text.toString().includes('<input type="submit" class="w-button" value="Entrar" />')
    expect(response.statusCode).toEqual(200);
    expect(buttonEntrar).toEqual(true);
    // expect(response.body.valorDescontado).toEqual(5);
})

test('Verificar se usuário foi criado na sessão  ao enviar dados na tela home', async () => {
   const response = await testSession.post('/')
    console.log(response)
    //espera redicionamento
    expect(response.statusCode).toEqual(302)
});