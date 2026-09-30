import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD42Mv47AAAhmjQ5gC3FlIF8XYbJDIAl1o",
  authDomain: "isaiot1.firebaseapp.com",
  projectId: "isaiot1",
  storageBucket: "isaiot1.firebasestorage.app",
  messagingSenderId: "981528957277",
  appId: "1:981528957277:web:3d700a2bcb22ca142098b4",
  measurementId: "G-HMND5NVVM5"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const authView = document.getElementById("authView");
const appView = document.getElementById("appView");
const loginForm = document.getElementById("loginForm");
const createAccount = document.getElementById("createAccount");
const authMessage = document.getElementById("authMessage");
const logout = document.getElementById("logout");
const currentUser = document.getElementById("currentUser");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const counter = document.getElementById("counter");
const taskMessage = document.getElementById("taskMessage");

let unsubscribe = null;

function showAuthMessage(text, error = false) {
  authMessage.textContent = text;
  authMessage.className = error ? "message error" : "message success";
}

function showTaskMessage(text, error = false) {
  taskMessage.textContent = text;
  taskMessage.className = error ? "message error" : "message success";
}

function firebaseError(error) {
  const messages = {
    "auth/email-already-in-use": "Este e-mail já possui uma conta.",
    "auth/invalid-email": "Digite um e-mail válido.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/operation-not-allowed": "O login por e-mail/senha está desativado no Firebase.",
    "auth/network-request-failed": "Erro de conexão com o Firebase.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente novamente."
  };
  return messages[error.code] || `${error.code || "Erro"}: ${error.message || "Não foi possível concluir a operação."}`;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showAuthMessage("Entrando...");

  try {
    await signInWithEmailAndPassword(
      auth,
      document.getElementById("email").value.trim(),
      document.getElementById("password").value
    );
    loginForm.reset();
  } catch (error) {
    console.error(error);
    showAuthMessage(firebaseError(error), true);
  }
});

createAccount.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAuthMessage("Preencha e-mail e senha antes de criar a conta.", true);
    return;
  }

  if (password.length < 6) {
    showAuthMessage("A senha precisa ter pelo menos 6 caracteres.", true);
    return;
  }

  showAuthMessage("Criando conta...");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showAuthMessage("Conta criada com sucesso!");
    loginForm.reset();
  } catch (error) {
    console.error(error);
    showAuthMessage(firebaseError(error), true);
  }
});

logout.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    authView.hidden = false;
    appView.hidden = true;

    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    taskList.innerHTML = "";
    counter.textContent = "0";
    emptyState.hidden = false;
    return;
  }

  authView.hidden = true;
  appView.hidden = false;
  currentUser.textContent = user.email;

  startRealtimeTasks(user.uid);
});

function startRealtimeTasks(uid) {
  if (unsubscribe) unsubscribe();

  const tasksQuery = query(
    collection(db, "tarefas"),
    where("uid", "==", uid)
  );

  unsubscribe = onSnapshot(
    tasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      tasks.sort((a, b) => {
        const aTime = a.criadaEm?.seconds || 0;
        const bTime = b.criadaEm?.seconds || 0;
        return bTime - aTime;
      });

      renderTasks(tasks);
    },
    (error) => {
      console.error(error);
      showTaskMessage(
        "Não foi possível ler o Firestore. Verifique as regras do banco.",
        true
      );
    }
  );
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = auth.currentUser;
  const title = taskTitle.value.trim();

  if (!user || !title) return;

  try {
    await addDoc(collection(db, "tarefas"), {
      titulo: title,
      concluida: false,
      uid: user.uid,
      criadaEm: serverTimestamp()
    });

    taskForm.reset();
    showTaskMessage("Tarefa criada!");
    setTimeout(() => showTaskMessage(""), 1500);
  } catch (error) {
    console.error(error);
    showTaskMessage("Erro ao criar tarefa: " + error.message, true);
  }
});

function renderTasks(tasks) {
  taskList.innerHTML = "";
  counter.textContent = String(tasks.length);
  emptyState.hidden = tasks.length !== 0;

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task" + (task.concluida ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.concluida);
    checkbox.title = "Marcar como concluída";

    checkbox.addEventListener("change", async () => {
      try {
        await updateDoc(doc(db, "tarefas", task.id), {
          concluida: checkbox.checked
        });
      } catch (error) {
        console.error(error);
        showTaskMessage("Erro ao atualizar a tarefa.", true);
      }
    });

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.titulo;

    const edit = document.createElement("button");
    edit.className = "small secondary";
    edit.textContent = "Editar";

    edit.addEventListener("click", async () => {
      const newTitle = prompt("Digite o novo nome da tarefa:", task.titulo);
      if (newTitle === null) return;

      const value = newTitle.trim();
      if (!value) return;

      try {
        await updateDoc(doc(db, "tarefas", task.id), {
          titulo: value
        });
      } catch (error) {
        console.error(error);
        showTaskMessage("Erro ao editar a tarefa.", true);
      }
    });

    const del = document.createElement("button");
    del.className = "small danger";
    del.textContent = "Excluir";

    del.addEventListener("click", async () => {
      if (!confirm("Deseja realmente excluir esta tarefa?")) return;

      try {
        await deleteDoc(doc(db, "tarefas", task.id));
      } catch (error) {
        console.error(error);
        showTaskMessage("Erro ao excluir a tarefa.", true);
      }
    });

    li.append(checkbox, title, edit, del);
    taskList.appendChild(li);
  }
}
