# Organizador de Estudos

Projeto da atividade de HTML, CSS, JavaScript e Firebase.

## Tecnologias

- HTML
- CSS
- JavaScript puro
- Firebase Authentication
- Cloud Firestore
- Vercel

## Funcionalidades

- Cadastro com e-mail e senha
- Login
- Logout
- Criar tarefa
- Listar tarefas em tempo real
- Editar tarefa
- Marcar tarefa como concluída
- Excluir tarefa

## Firebase

Projeto utilizado:

`isaiot1`

O código usa o Firebase Web SDK diretamente por CDN, portanto não é necessário executar `npm install firebase` para abrir este projeto.

## Configuração obrigatória no Firebase

No projeto `isaiot1`:

1. Abra **Authentication > Sign-in method**.
2. Ative **E-mail/Password**.
3. Abra **Authentication > Settings > Authorized domains**.
4. Adicione o domínio fornecido pela Vercel, por exemplo:
   `atividade-iot.vercel.app`
5. Crie o **Cloud Firestore**.
6. Publique o conteúdo de `firestore.rules`.

## Rodar localmente

No VS Code, abra o projeto com Live Server.

Também é possível usar:

```bash
python -m http.server 8000
```

Depois acesse:

`http://localhost:8000`

## Vercel

Ao importar o projeto na Vercel:

- Framework Preset: Other
- Build Command: vazio
- Output Directory: `.`
- Install Command: vazio
- Root Directory: `/`

Não são necessárias variáveis de ambiente para esta versão.

## CRUD

- Create: `addDoc()`
- Read: `onSnapshot()`
- Update: `updateDoc()`
- Delete: `deleteDoc()`

## Evidências

Para a atividade, tire prints de:

1. Cadastro/login;
2. Usuário no Firebase Authentication;
3. Tarefa criada;
4. Documento no Firestore;
5. Tarefa editada;
6. Tarefa concluída;
7. Tarefa excluída;
8. Site funcionando na Vercel.
