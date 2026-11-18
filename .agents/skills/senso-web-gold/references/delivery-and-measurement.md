# Entrega, SEO y medición

## Implementación
Leer las instrucciones locales y revisar el estado del proyecto antes de editar. Identificar los archivos autorizados y los componentes compartidos que podrían afectar a otras páginas.

Trabajar en una versión aislada cuando sea viable. Mantener un cambio reversible y revisar el diff final. Preservar los cambios preexistentes del usuario.

Utilizar la arquitectura existente y soluciones ligeras. No migrar de stack, crear otro sitio, añadir dependencias o contratar servicios por comodidad. Verificar la configuración del alojamiento antes de desplegar. No confundir URLs de preview y producción.

## QA proporcional
Comprobar lo afectado:
- Desktop y móvil: navegación, jerarquía, recortes, desbordamientos y CTAs.
- EN/ES cuando correspondan: textos, enlaces, estado de idioma y estructura.
- Accesibilidad: teclado, foco, contraste, etiquetas y controles.
- Comportamiento: enlaces, menús, modales, cierres y errores relevantes.
- Formularios: validación, éxito/error y recuperación mediante interceptación o un entorno seguro; no enviar pruebas reales a terceros sin autorización.
- Componentes compartidos: regresiones en las páginas que puedan verse afectadas.

Verificar las dimensiones reales del viewport antes de declarar una prueba móvil. Un comando de resize exitoso no demuestra que el navegador haya aplicado el tamaño.

Relacionar la versión revisada con la desplegada y comprobar la URL. Diferenciar prueba local, preview, producción y dispositivo real. No repetir comprobaciones sin cambios ni dudas nuevas que lo justifiquen.

## SEO y adquisición
Partir de intención de búsqueda y oferta real. Priorizar oportunidades con conexión comercial sin desatender el valor editorial y de marca.

Separar datos propios, estimaciones de herramientas e hipótesis. Verificar fuentes oficiales actuales para cuestiones técnicas inciertas. No inventar posiciones, demanda, indexación, tráfico o conversiones.

Revisar, cuando proceda, títulos, indexación, canonicals, sitemap, enlaces internos, datos estructurados, idiomas y rendimiento. No modificar elementos ajenos al alcance.

Distinguir el título oficial de la home y el nombre de sitio en Google. No prometer cómo Google mostrará el resultado. Proponer páginas nuevas o idiomas antes de implementarlos.

## Medición
Distinguir visitas, clics, envíos correctos, consultas recibidas, leads válidos, reuniones, propuestas y ventas. Un clic o una respuesta técnica del navegador no prueban un lead comercial.

Inspeccionar la instrumentación existente antes de añadir eventos; preservar definiciones válidas y evitar duplicados. Comprobar consentimiento, fuente y destino antes de interpretar los datos.

Para cada experimento, definir hipótesis, métrica, línea base disponible y criterio de evaluación. Usar periodos comparables. Con poco tráfico, explicitar la limitación y complementar con evidencia cualitativa; no presentar fluctuaciones como victorias.

No alterar cookies, privacidad ni consentimiento sin autorización. Consultar fuentes oficiales actuales para cuestiones legales relevantes y señalar la incertidumbre.

## Cierre
Preparar la candidata y validarla antes de solicitar aprobación de producción. Con autorización explícita ya concedida para esa publicación y alcance, no pedirla de nuevo; verificar que la versión corresponde a lo aprobado.

Reportar qué cambió, por qué, qué se probó y qué queda pendiente. Ante un despliegue fallido, no declararlo disponible. Mantener la versión anterior recuperable.
