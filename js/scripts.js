function login() {
  const user = document.getElementById("userInput").value.trim();
  const pin = document.getElementById("pinInput").value.trim();

  // esto Compañeros solo es para demostrar al ing como fuciona.
  const validUser = "udb";
  const validPin = "0000";

  if (user === validUser && pin === validPin) {
    swal({
      title: "¡Acceso concedido!",
      text: "Bienvenido " + user,
      icon: "https://i.ibb.co/Ysrg8LV/pokemon-bank-ok-01.png",
      button: "Entrar",
    }).then(() => {
      window.location.href = "dashboard.html";
    });
  } else {
    swal({
      title: "Datos incorrectos",
      text: "Usuario o PIN no válidos",
      icon: "https://i.ibb.co/N2rdmjtz/pokemon-bank-ok-02.png",
      button: "Reintentar",
    });
  }
}

// esto compañeros es paraPermitir login con Enter
document.addEventListener("keyup", function (e) {
  if (e.key === "Enter") login();
});

// Retiro ATM
const SUCCESS_IMAGE_URL = "https://i.ibb.co/fz9P1yCT/ICON-EXITOSO.jpg";

document.addEventListener("DOMContentLoaded", () => {
  // Referencias DOM
  const balanceEl = document.getElementById("balance-display"); //cantidad ingresada en saldo inicial
  const withdrawForm = document.getElementById("withdraw-form"); //el formulario ip withdraw-form
  const withdrawInput = document.getElementById("withdraw-amount"); //la cantidad ingresada en withdra-form

  if (!balanceEl || !withdrawForm || !withdrawInput) {
    console.warn(
      "withdraw.js: elementos DOM faltantes. Verifica IDs: balance-display, withdraw-form, withdraw-amount"
    ); //en caso de que el saldo incial o no existan el formulario genera una alerta
    return; // no seguimos si faltan elementos
  }

  // Parsear balance inicial desde data-balance (número en formato "1000.00", en caso no este declarado inicializa con "0"
  let balance = parseFloat(balanceEl.dataset.balance ?? "0");

  // Formateador de dinero a dos decimales
  function formatMoney(value) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  //actualiza el saldo declarado en data-balance en html, al realizar operacion
  function updateBalanceUI() {
    if (!balanceEl) return;
    balanceEl.dataset.balance = balance.toFixed(2);
    balanceEl.textContent = `Saldo Actual: $${formatMoney(balance)}`;
  }

  updateBalanceUI(); // sincroniza UI al inicio

  // Manejo del submit-preventDefault no permite que se refresque la pagina
  withdrawForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const raw = withdrawInput.value;
    const amount = parseFloat(raw === "" ? NaN : raw);

    // Validaciones cliente
    if (isNaN(amount)) {
      Swal.fire({
        icon: "warning",
        title: "Monto inválido",
        text: "Por favor ingrese un monto válido a retirar.",
      });
      return;
    }
    if (amount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Operación inválida",
        text: "El monto debe ser superior o igual a $0.01.",
      });
      return;
    }
    if (amount > balance) {
      Swal.fire({
        icon: "error",
        title: "Saldo insuficiente",
        text: "Operación rechazada: saldo insuficiente para cubrir el retiro.",
      });
      return;
    }

    // Confirmación
    Swal.fire({
      title: "Confirmar retiro",
      html: `¿Confirma el retiro de <strong>$${amount.toFixed(2)}</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar retiro",
      cancelButtonText: "Cancelar",
      focusCancel: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      const code = Math.floor(Math.random() * 900000) + 100000; //-creamos un numero aleatorio como codigo de retiro ATM//

      balance = parseFloat((balance - amount).toFixed(2));
      updateBalanceUI(); //actualizamos el saldo de balance con la operacion//

      Swal.fire({
        title: "Retiro exitoso",
        html:
          "Código de retiro sin tarjeta (ATM):<br>" +
          `<strong id="withdraw-code" style="font-size:1.4rem">${code}</strong>` +
          "<br><small>Válido por 30 minutos.</small>" +
          '<br><button id="copy-code-btn" class="swal2-styled" style="margin-top:10px">Copiar código</button>',
        imageUrl: SUCCESS_IMAGE_URL,
        imageWidth: 96,
        imageHeight: 96,
        imageAlt: "Retiro exitoso",
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
        didOpen: () => {
          const copyBtn = document.getElementById("copy-code-btn");
          if (!copyBtn) return;
          copyBtn.addEventListener("click", async () => {
            try {
              await navigator.clipboard.writeText(String(code));
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Código copiado",
                showConfirmButton: false,
                timer: 1400,
              });
            } catch (err) {
              // Fallback
              try {
                const codeEl = document.getElementById("withdraw-code");
                const range = document.createRange();
                range.selectNode(codeEl);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                document.execCommand("copy");
                sel.removeAllRanges();
                Swal.fire({
                  toast: true,
                  position: "top-end",
                  icon: "success",
                  title: "Código copiado",
                  showConfirmButton: false,
                  timer: 1400,
                });
              } catch (err2) {
                Swal.fire({
                  icon: "error",
                  title: "No se pudo copiar",
                  text: "Copie el código manualmente.",
                });
              }
            }
          });
        },
      });
    });
  });
});

// Creacion de graficos con Chart.js
const ctx = document.getElementById("transactionChart").getContext("2d");
const transactionChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Depósito", "Retiro", "Pago de Servicios"],
    datasets: [
      {
        label: "Número de Transacciones",
        data: [3, 2, 4],
        backgroundColor: [
          "#28a745", // Verde para Depósito
          "#ffc107", // Amarillo para Retiro
          "#007bff", // Azul para Pago de Servicios
        ],
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Análisis de Tipos de Transacciones",
      },
    },
  },
});

const ctx2 = document.getElementById("servicePaymentChart").getContext("2d");
const servicePaymentChart = new Chart(ctx2, {
  type: "doughnut",
  data: {
    labels: ["Energía Eléctrica", "Internet", "Telefonía", "Agua Potable"],
    datasets: [
      {
        label: "Número de Pagos de Servicios",
        data: [1, 1, 1, 1],
        backgroundColor: [
          "#28a745", // Verde
          "#ffc107", // Amarillo
          "#007bff", // Azul
          "#17a2b8", // Cyan
        ],
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Análisis de Tipos de Pagos de Servicios",
      },
    },
  },
});
