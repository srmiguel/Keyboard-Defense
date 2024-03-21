// Configuración del juego
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 1600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  },
  vidas: 3
};

// Inicialización del juego
const game = new Phaser.Game(config);

let palabras = [];
let palabraActual;
let textoPalabra;
let velocidadCaida = 100; // Ajustar la velocidad de caída según sea necesario
let tiempoUltimaPalabra = 0;
let platforms;

// Función de precarga de recursos
function preload() {
  this.load.image('sky', 'assets/images/sky.png'); // Cargar imagen del cielo
  this.load.image('ground', 'assets/images/platform.png'); // Cargar imagen del suelo
  this.load.text('palabras', 'assets/words.txt');
}

// Función de creación de elementos del juego
function create() {
  const textoPalabras = this.cache.text.get('palabras');
  palabras = textoPalabras.split('\n');

  // Agregar el cielo
  this.add.image(400, 300, 'sky');

  // Agregar las plataformas
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

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
  // No se requiere lógica de actualización en este momento
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
  scene.physics.world.enable(textoPalabra); // Habilitar la física para la palabra
  textoPalabra.body.setVelocityY(velocidadCaida); // Establecer la velocidad de caída
}
