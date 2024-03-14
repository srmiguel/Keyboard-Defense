// Configuración del juego
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

// Inicialización del juego
const game = new Phaser.Game(config);

let palabras = [];
let palabraActual;
let textoPalabra;
let velocidadCaida = 1; // Ajustar la velocidad de caída según sea necesario
let tiempoUltimaPalabra = 0;

// Función de precarga de recursos
function preload() {
  this.load.text('palabras', 'assets/words.txt');
}

// Función de creación de elementos del juego
function create() {
  const textoPalabras = this.cache.text.get('palabras');
  palabras = textoPalabras.split('\n');

  actualizarPalabra(this);

  this.input.keyboard.on('keydown', function (event) {
      const letraPresionada = event.key.toLowerCase();
      const primeraLetra = palabraActual[0].toLowerCase();

      if (letraPresionada === primeraLetra) {
          palabraActual = palabraActual.substring(1);
          textoPalabra.setText(palabraActual);
          if (palabraActual === '') {
              actualizarPalabra(this);
          }
      } else {
          // El jugador cometió un error, agregar aquí la lógica de manejo de errores
      }
  });
}

// Función de actualización del juego
function update(time) {
  // Movimiento de caída de la palabra
  textoPalabra.y += velocidadCaida;

  // Verificar si la palabra alcanzó la parte inferior de la pantalla
  if (textoPalabra.y > 600) {
      actualizarPalabra(this);
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
