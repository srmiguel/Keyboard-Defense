// Configuración del juego
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 900,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0 },
          debug: false
      }
  },

  autoCenter: Phaser.Scale.CENTER_BOTH, // Centra el juego en el centro de la ventana del navegador
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
let velocidadCaida = 10; // Ajustar la velocidad de caída según sea necesario
let tiempoUltimaPalabra = 0;
let jugador;

// Función de precarga de recursos
function preload() {
  this.load.image('sky', 'assets/images/sky.png'); // Cargar imagen del cielo
  this.load.text('palabras', 'assets/words.txt');
  this.load.image('jugador', 'assets/images/player.png'); // Cargar imagen del jugador
}

// Función de creación de elementos del juego
function create() {
  const textoPalabras = this.cache.text.get('palabras');
  palabras = textoPalabras.split('\n');

  // Agregar el cielo
  this.add.image(300, 450, 'sky'); // Centrar el cielo horizontalmente y alinearlo en la parte superior

  // Mostrar el número de vidas
  this.textoVidas = this.add.text(500, 20, 'Vidas: ' + config.vidas, { fontSize: '24px', fill: '#fff' }).setOrigin(1, 0); // Alineado en la esquina superior derecha

  // Agregar al jugador
  jugador = this.physics.add.sprite(300, 800, 'jugador').setScale(0.5); // Crear al jugador en la parte central inferior

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
function update() {
    // Obtener la posición actual del jugador
    const jugadorX = jugador.x;
    const jugadorY = jugador.y;

    // Verificar si hay una palabra presente en pantalla
    if (textoPalabra) {
        // Calcular la dirección hacia la que deben moverse las palabras
        const direccionX = jugadorX - textoPalabra.x;
        const direccionY = jugadorY - textoPalabra.y;

        // Normalizar la dirección
        const longitud = Math.sqrt(direccionX * direccionX + direccionY * direccionY);
        const velocidadPalabras = 1; // Definir la velocidad de las palabras
        const velocidadX = direccionX / longitud;
        const velocidadY = direccionY / longitud;

        // Aplicar la velocidad horizontal a las palabras para moverlas hacia el jugador
        textoPalabra.x += velocidadX * velocidadPalabras;
        textoPalabra.y += velocidadY * velocidadPalabras;

        // Verificar la colisión con el jugador
        if (Phaser.Geom.Intersects.RectangleToRectangle(jugador.getBounds(), textoPalabra.getBounds())) {
            // Reducir el número de vidas
            config.vidas--;

            // Actualizar el texto de vidas en la pantalla
            this.textoVidas.setText('Vidas: ' + config.vidas);

            // Destruir la palabra
            textoPalabra.destroy();

            // Reiniciar el juego si el jugador se queda sin vidas
            if (config.vidas <= 0) {
                // Mostrar "GAME OVER" en el centro de la pantalla
                this.add.text(300, 450, 'GAME OVER', { fontSize: '64px', fill: '#fff', align: 'center' }).setOrigin(0.5);
                
                // Detener la actualización del juego
                this.scene.pause();
            } else {
                // Crear una nueva palabra si el jugador aún tiene vidas
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
  textoPalabra = scene.add.text(Phaser.Math.Between(100, 500), -50, palabraActual, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
  scene.physics.world.enable(textoPalabra); // Habilitar la física para la palabra
  textoPalabra.body.setVelocityY(velocidadCaida); // Establecer la velocidad de caída
}
