# Catálogo de libros para Windows 11

Aplicación Electron que consume exclusivamente el XML de un endpoint de libros. Por defecto usa `http://34.51.75.204:5001/books`; se puede cambiar desde **Configuración** y queda guardado en `localStorage`.

## Ejecutar

```powershell
cd electron-catalog
npm.cmd install
npm.cmd start
```

La app solicita el catálogo al abrirse y al pulsar **Actualizar**. La paginación es local después de cada petición XML. El endpoint debe devolver elementos `<book>` dentro de `<books>`.

Los campos `autor(es)`, `stock` y `año` se mostrarán como `No disponible` mientras el XML no los entregue; no se inventan ni se consultan fuentes adicionales.
