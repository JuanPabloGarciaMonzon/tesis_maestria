Vue.createApp({
    data() {
      return {
        titulo: 'Sistema de monitoreo',
        parrafo: 'Esta página es un sistema de monitoreo web para obtener información importante acerca de la red, dispositivos conectados. Además de la información en tiempo real de una serie de sensores conectados al microcontrolador Arduino MEGA 2560. Todo esto para tener un control de una red domótica, para tener un control de que dispositivos podrían tener accesso a estos datos importantes.',
        temperatura: '---',
        temperaturaGrafica: [],
        humedad: '---',
        luz: '---',
        distancia: '---'
      }
    },
    mounted ()  {
      this.iniciarDataTable();
      setInterval(this.obtenerRed, 5000);
      setInterval(this.obtenerDatos, 1000);
    },
    methods: {
      iniciarDataTable() {
        $('#dispositivos').DataTable({
            paging: true,
            searching: true,
            info: true,
            autoWidth: false,
            columns: [
              { title: 'IP' },
              { title: 'MAC' },
              { title: 'Hostname' },
              { title: 'Sistema operativo' },
              { title: 'Tipo de dispositivo' }
          ]
        });
      },
      llenarCards(devices) {
          const divTarjetas = document.getElementById('grupo_tarjetas');
          var contadorDesconocidos = 0;
          divTarjetas.innerHTML = '';
  
          devices.forEach(device => {
            if (device.device_type == "Desconocido" || device.device_type == "Unknown") {
              contadorDesconocidos++;
            }
              const card = document.createElement('div');
              card.className = 'card';
  
              card.innerHTML = `
                  <div class="card-header">${device.device_type}</div>
                  <div class="card-body">
                      <p><strong>IP:</strong> ${device.ip}</p>
                      <p><strong>MAC:</strong> ${device.mac}</p>
                      <p><strong>Sistema operativo:</strong> ${device.os_type}</p>
                      <p><strong>Hostname:</strong> ${device.hostname}</p>
                  </div>
              `;
              divTarjetas.appendChild(card);
          });
          if (contadorDesconocidos > 0) {
            console.log("Mostrando notificación de advertencia");
            var mensaje = `Se encontraron ${contadorDesconocidos} dispositivos desconocidos. Se recomienda revisar sus dispositivos para evitar una intrusión.`;
            notificacionSencilla(mensaje, "warning");
        }
      },
      async obtenerDatos() {
        try {
          const response = await fetch('http://192.168.10.130:81');
          const data = await response.json();
          this.temperatura = `${data.temperature} C°`
          this.temperaturaGrafica.push(data.temperature);
          this.humedad = `${data.humidity} %`;
          this.distancia = `${data.distance} cm`;
          this.luz = `${data.light} lux`;
          TESTER = document.getElementById('chart');
          Plotly.newPlot( TESTER, [{
          y: this.temperaturaGrafica }], {
          margin: { t: 0 } } );
      } catch (error) {
          console.error('Error al obtener datos:', error);
      }
      },
      async obtenerRed() {
        try {
          const response = await fetch('http://localhost:5000/getNetwork');
          const data = await response.json();
          var nuevaRed = `${data.network}`;
          var boton = document.getElementById("buscarDispositivos");
          if (this.red !== nuevaRed) { // Comparar el valor actual con el nuevo
            this.red = nuevaRed; // Actualizar el valor almacenado
            var boton = document.getElementById("buscarDispositivos");
            if (this.red !== '---') {
              boton.hidden = false;
              notificacionSencilla(
                `La red a la que está conectado actualmente es ${this.red}. Se recomienda que si usted tiene acceso a la administración de su punto de acceso, por favor mantenga una política de cambio de contraseña periódica para evitar dispositivos intrusos.`,
                "warning"
              );
            }
          }
        } catch (error) {
          console.error('Error al obtener la red', error);
        }
      },
      async obtenerDispositivosConectados() {
        try {
        var network = this.red;
        notificacionSpinner();
        $.ajax({
            url: `http://localhost:5000/scan?network=${network}`,
            method: 'GET',
            contentType: 'application/json',
            processData: false,
            success: (response) => {
              console.log(response.devices);
              if (response.devices && response.devices.length > 0) {
                this.llenarCards(response.devices);
              } else {
                notificacionSencilla("No se encontraron dispositivos.");
              }
            },
            error: (xhr, status, error) => {
                notificacionSencilla("Ha ocurrido un error al obtener los dispositivos.");
                console.error('Error en la solicitud:', error);
            }
        });
        } catch (error) {
          console.error('Error al obtener los dispositivos conectados', error);
        }
      }
    }
  }).mount('#data');