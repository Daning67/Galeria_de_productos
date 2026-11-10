import './style.css';
import { productos } from './productos.js';

// Elementos del DOM
const galeria = document.getElementById('galeria');
const contadorProductos = document.getElementById('contador-productos');
const inputPrecio = document.getElementById('precio-maximo');
const btnFiltrarPrecio = document.getElementById('btn-filtrar-precio');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
const mensajeError = document.getElementById('mensaje-error');
const botonesCategoria = document.querySelectorAll('.btn-categoria');

// Variables de estado para filtros combinados
let categoriaActual = 'Todos';
let precioMaximo = null;

// Convierte el nombre de la categoría en una clase CSS válida sin acentos
function normalizarCategoria(categoria) {
  return categoria
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Muestra un mensaje de error visible en pantalla
function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
}

// Limpia el mensaje de error de la pantalla
function limpiarError() {
  mensajeError.textContent = '';
}

// Actualiza el contador de productos visibles en la interfaz
function actualizarContador(cantidad) {
  contadorProductos.textContent = String(cantidad);
}

// Función para renderizar las tarjetas en la galería usando map()
function renderizarProductos(lista) {
  actualizarContador(lista.length);

  // Si la lista está vacía se muestra el mensaje correspondiente
  if (lista.length === 0) {
    galeria.innerHTML = '<p class="mensaje-vacio">No se encontraron productos</p>';
    return;
  }

  // Uso de map() para transformar el arreglo de productos en elementos HTML
  const tarjetasHTML = lista
    .map((producto) => {
      const claseCategoria = normalizarCategoria(producto.categoria);
      return `
        <article class="tarjeta-producto" data-categoria="${producto.categoria}">
          <div class="tarjeta-imagen">
            <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" data-categoria="${producto.categoria}">
            <span class="badge badge-${claseCategoria}">${producto.categoria}</span>
          </div>
          <div class="tarjeta-cuerpo">
            <h2 class="tarjeta-nombre">${producto.nombre}</h2>
            <p class="tarjeta-precio">$${producto.precio.toFixed(2)}</p>
          </div>
        </article>
      `;
    })
    .join('');

  galeria.innerHTML = tarjetasHTML;
}

// Función para combinar los filtros de categoría y precio usando filter()
function aplicarFiltros() {
  // Uso de filter() para evaluar simultáneamente la categoría y el precio máximo
  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaActual === 'Todos' || producto.categoria === categoriaActual;
    const coincidePrecio =
      precioMaximo === null || producto.precio <= precioMaximo;

    return coincideCategoria && coincidePrecio;
  });

  renderizarProductos(productosFiltrados);
}

// Maneja la selección de categorías mediante los botones
function cambiarCategoria(categoriaSeleccionada, botonActivo) {
  categoriaActual = categoriaSeleccionada;

  // Actualiza la clase activa en los botones de categoría
  botonesCategoria.forEach((boton) => boton.classList.remove('activo'));
  botonActivo.classList.add('activo');

  aplicarFiltros();
}

// Valida y aplica el filtro por precio máximo
function filtrarPorPrecio() {
  const valor = inputPrecio.value.trim();

  // Validación: campo vacío
  if (valor === '') {
    mostrarError('Por favor, ingresa un precio para filtrar.');
    return;
  }

  const precio = Number(valor);

  // Validación: no es un número o es negativo
  if (Number.isNaN(precio) || precio < 0) {
    mostrarError('El precio debe ser un número mayor o igual a 0.');
    return;
  }

  limpiarError();
  precioMaximo = precio;
  aplicarFiltros();
}

// Restablece todos los filtros y controles a su estado inicial
function restablecerFiltros() {
  categoriaActual = 'Todos';
  precioMaximo = null;
  inputPrecio.value = '';
  limpiarError();

  botonesCategoria.forEach((boton) => {
    if (boton.dataset.categoria === 'Todos') {
      boton.classList.add('activo');
    } else {
      boton.classList.remove('activo');
    }
  });

  aplicarFiltros();
}

// Configuración de escuchadores de eventos (addEventListener)
botonesCategoria.forEach((boton) => {
  boton.addEventListener('click', () => {
    cambiarCategoria(boton.dataset.categoria, boton);
  });
});

btnFiltrarPrecio.addEventListener('click', filtrarPorPrecio);

inputPrecio.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    filtrarPorPrecio();
  }
});

btnLimpiarFiltros.addEventListener('click', restablecerFiltros);

// Fallback en fase de captura para imágenes que fallen al cargar (el evento error no burbujea)
galeria.addEventListener(
  'error',
  (evento) => {
    const elemento = evento.target;
    if (elemento && elemento.tagName === 'IMG') {
      const tarjeta = elemento.closest('.tarjeta-producto');
      const categoria = tarjeta ? tarjeta.dataset.categoria : (elemento.dataset.categoria || '');

      let emoji = '📦';
      if (categoria === 'Tecnología') {
        emoji = '💻';
      } else if (categoria === 'Hogar') {
        emoji = '🏠';
      } else if (categoria === 'Ropa') {
        emoji = '👕';
      }

      const bloqueFallback = document.createElement('div');
      bloqueFallback.className = 'imagen-fallback';
      bloqueFallback.textContent = emoji;
      bloqueFallback.setAttribute('role', 'img');
      bloqueFallback.setAttribute('aria-label', `Imagen no disponible para ${categoria}`);

      elemento.replaceWith(bloqueFallback);
    }
  },
  true
);

// Carga inicial: renderizar todos los productos una sola vez
renderizarProductos(productos);
