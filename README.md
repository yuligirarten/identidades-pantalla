# Identidades en pantalla

Web doc interactivo de investigación-creación sobre cómo los jóvenes recién egresados (22–27 años) construyen identidad en Instagram, integrando imagen, texto y algoritmo.

- **Autora**: Yulianna Girarte Neria
- **Programa**: Maestría en Humanidades Digitales · Tec de Monterrey
- **Etapa**: PD II · entrega intermedia (prototipo al 50%)

## Stack

HTML5 + CSS + JavaScript vanilla. Sin frameworks, sin build tools.

- Tipografías: Fraunces (display), Inter Tight (cuerpo), JetBrains Mono (datos y mono), vía Google Fonts.
- Datos: `data/data.json` (v0.4).
- Navegación: router por hash (`#p00` a `#p06`), una sección visible a la vez.

## Cómo correrlo localmente

El navegador bloquea la lectura de `data/data.json` cuando abres `index.html` con doble-click (protocolo `file://`). Necesitas un servidor local. Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Luego abre `http://localhost:8000` en el navegador.

Alternativas: la extensión "Live Server" de VS Code, `npx serve`, o cualquier servidor estático.

## Estructura

```
.
├── index.html              # Documento principal con las 7 secciones (P00–P06)
├── css/
│   ├── tokens.css          # Variables: paleta papel/tinta, tipografías, espaciado
│   ├── base.css            # Reset, tipografía, header, navegación, CTAs, placeholders
│   └── modules.css         # Estilos específicos por módulo
├── js/
│   ├── data.js             # Carga y consulta de data.json
│   └── router.js           # Router por hash y wiring de módulos
├── data/
│   └── data.json           # Testimonios, posts, glosario, autocuestionario (v0.4)
├── docs/
│   └── wireframe_identidades_en_pantalla.html
└── README.md
```

## Sobre `data.json`

Versión actual: **0.4**. Estructura principal:

- `testimonios`: 15 testimonios codificados y anonimizados (T01–T15).
  - T01–T04: consultas exploratorias de PD I (comunicación política), aparecen solo en P03.
  - T05–T15: trabajo de campo de PD II (perfil central: jóvenes recién egresados).
- `posts_de_ig`: estructura vacía, se poblará en fases posteriores.
- `glosario`: vacío.
- `autocuestionario`: estructura con `preguntas` y `perfiles_resultado` vacíos.

### Convenciones de codificación

- `modulos` (array): en qué módulos del web doc aparece cada testimonio.
- `destacado` (boolean): solo `true` en testimonios hero de P02 o P03.
- `eje_vitrina_espejo` (-1 a 1, o `null`): posición en el eje vitrina/espejo para V-02. `null` en T01–T04 porque la categoría no aplica al perfil exploratorio.
- `reconoce_algoritmo`, `se_autocensura`, `mide_engagement`: booleanos de **uso personal** del participante. Son `null` en T02 y T04 porque sus citas describen práctica profesional para terceros, no su uso personal.
- `abstencion` (boolean): `true` cuando el participante describe retención total de publicación como acto identitario deliberado (categoría distinta de la autocensura selectiva). Solo aplica a T06.
- `_revisar` (boolean): marca testimonios donde la investigadora aplicó juicio interpretativo y los valores requieren validación.
- `_nota` (string): nota metodológica sobre casos especiales de codificación.

## Recorrido

| ID | Nombre | Estado |
|----|--------|--------|
| P00 | Inicio · pregunta detonante | Pendiente (Fase 4) |
| P01 | ¿Quién eres en Instagram? | Placeholder |
| P02 | La vitrina y el espejo | Pendiente (Fase 4) |
| P03 | El algoritmo invisible | Placeholder |
| P04 | Voces del campo | Pendiente (Fase 4) |
| P05 | ¿Y tú cómo te presentas? | Placeholder |
| P06 | Créditos | Pendiente (Fase 4) |

## Accesibilidad

- Skip link al contenido principal.
- Navegación por teclado funcional.
- Foco visible en todos los elementos interactivos.
- `prefers-reduced-motion` respetado.
- `aria-current` en el step activo.

## Licencias

- **Contenido** (citas, textos, datos): CC BY-NC-SA 4.0.
- **Código**: MIT.

## Publicación

Pensado para publicarse en GitHub Pages al cierre de PD II / PD III. En esta fase no se publica nada.
