Vue.createApp({
    data() {
      return {
        titulo: 'Monitor de sensores',
        parrafo: 'Esta página tiene la única función de mostrar en tiempo real como se están comportando los datos que se están sensando a partir de diferentes sensores conectados a un microcontrolador Arduino Mega 2560.',
        temperatura: '---',
        humedad: '---',
        luz: '---',
        distancia: '---'
      }
    },
    mounted ()  {
      this.obtenerDatos();
      setInterval(this.obtenerDatos, 1000);
    },
    methods: {
      async obtenerDatos() {
        const response = await fetch('http://192.168.10.130:81');  // Ajusta la IP y el puerto
        const data = await response.json();
        this.temperatura = `${data.temperature} °C`;
        this.humedad = `${data.humidity} %`;
        this.distancia = `${data.distance} cm`;
        this.luz = `${data.light} lux`;
      }
    }
  }).mount('#data');