# Sprint 1 image derivatives

These derivatives keep the original files untouched and are used only by the Art Consulting page.

| Original | Derivative used | Original size | Derivative size |
| --- | --- | ---: | ---: |
| `consulting_photos/interior1.png` | `Assets/images/consulting-interior1.jpg` | 2.20 MB | 398 KB |
| `consulting_photos/interior2.png` | `Assets/images/consulting-interior2.jpg` | 2.43 MB | 504 KB |
| `consulting_photos/restaurante1.png` | `Assets/images/consulting-restaurant1.jpg` | 2.69 MB | 602 KB |
| `consulting_photos/restaurante2.png` | `Assets/images/consulting-restaurant2.jpg` | 2.48 MB | 528 KB |

The derivatives were resized to a maximum display dimension of 1,800 px and encoded as high-quality JPEGs because the available local image tools did not provide a WebP encoder. Originals remain available for future art-directed exports.

Recovery verification: the interior originals are 1536 × 1024 px; their existing derivatives are 1800 × 1200 px. Restaurant originals are 1086 × 1448 px; derivatives are 1350 × 1800 px. These derivatives were upscaled in the original Sprint build, not downscaled. They reduce transfer bytes but do not add source detail. The recovery reuses them unchanged; the exact encoder quality setting is not recorded.
