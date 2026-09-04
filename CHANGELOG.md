# Changelog

## 1.1.0 — 2026-09-04

**El pack de armadura ya no hay que modificarlo.**

- Añadido un **resource pack integrado** con las 48 reglas de compatibilidad, activado por
  defecto. El pack de armadura se instala tal cual, sin parchear.
- Instalación reducida a **un solo archivo** en `mods/`.
- El pack integrado es **desactivable**: si tu pack de armadura trae sus propias reglas, las
  nuestras las pisarían al ir por encima; apagándolo quedan las suyas y se conserva la
  propiedad `armor_item`, que siguen necesitando.

Ventaja principal: el pack de armadura se puede **actualizar desde Modrinth con normalidad**,
sin tener que volver a parchearlo en cada versión.

## 1.0.0 — 2026-09-04

Primera versión.

- Propiedad **`armor_item`** para los `.properties` de EMF/ETF, que lee la armadura equipada
  directamente de la entidad (sin NBT, sin caché). Admite comodines, varios patrones y
  negación con `!`.
- Mixin en `PropertiesRandomProvider.entityCanUpdate()` para desbloquear la re-evaluación de
  condiciones que dependen del equipo.
- Mixin en `HumanoidArmorLayer.getArmorModel()` para que el modelo de armadura refresque su
  variante en vivo — sin esto no se actualiza hasta pulsar F3+T.

Requería aplicar las reglas al pack de armadura a mano.
