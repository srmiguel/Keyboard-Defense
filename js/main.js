// Configuración del juego
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
      preload: preload,
      create: create,
      update: update
  },
  vidas: 3 // Definir número inicial de vidas
};

// Inicialización del juego
const game = new Phaser.Game(config);

let palabras = [];
let palabraActual;
let textoPalabra;
let velocidadCaida = 2; // Ajustar la velocidad de caída según sea necesario
let tiempoUltimaPalabra = 0;

// Función de precarga de recursos
function preload() {
  this.load.text('palabras', 'assets/words.txt');
}

// Función de creación de elementos del juego
function create() {
  const textoPalabras = this.cache.text.get('palabras');
  palabras = textoPalabras.split('\n');

  // Mostrar el número de vidas
  this.textoVidas = this.add.text(650, 20, 'Vidas: ' + config.vidas, { fontSize: '24px', fill: '#fff' });

  // Manejar eventos de teclado
  this.input.keyboard.on('keydown', function (event) {
    const letraPresionada = event.key.toLowerCase();
    const proximaLetra = palabraActual[0].toLowerCase();

    if (letraPresionada === proximaLetra) {
        // Eliminar la primera letra de la palabra
        palabraActual = palabraActual.substring(1);
        textoPalabra.setText(palabraActual);

        // Si la palabra está vacía, destruir la palabra y actualizar si hay más disponibles
        if (palabraActual === '') {
            textoPalabra.destroy();
            if (config.vidas > 0) {
                actualizarPalabra(this);
            }
        }
    } else {
        // El jugador cometió un error, agregar aquí la lógica de manejo de errores
    }
  }, this);

  actualizarPalabra(this);
}

// Función de actualización del juego
function update(time) {
  // Verificar si hay una palabra presente en pantalla
  if (textoPalabra) {
    // Movimiento de caída de la palabra
    textoPalabra.y += velocidadCaida;

    // Verificar si la palabra llega al final de la pantalla
    if (textoPalabra.y > 600) {
      // Reducir el número de vidas
      config.vidas--;

      // Actualizar el texto de vidas en la pantalla
      this.textoVidas.setText('Vidas: ' + config.vidas);

      // Reiniciar el juego si el jugador se queda sin vidas
      if (config.vidas <= 0) {
        // Mostrar "GAME OVER" en el centro de la pantalla
        this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#fff', align: 'center' }).setOrigin(0.5);
        
        // Detener la actualización del juego
        this.scene.pause();
      } else {
        // Actualizar la palabra si el jugador aún tiene vidas
        actualizarPalabra(this);
      }
    }
  }
}

// Función para obtener una palabra aleatoria
function obtenerPalabraAleatoria() {
  const indice = Phaser.Math.RND.between(0, palabras.length - 1);
  return palabras[indice];
}

// Función para actualizar la palabra mostrada
function actualizarPalabra(scene) {
  palabraActual = obtenerPalabraAleatoria();
  if (textoPalabra) {
      textoPalabra.destroy();
  }
  textoPalabra = scene.add.text(Phaser.Math.Between(100, 700), -50, palabraActual, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
}
