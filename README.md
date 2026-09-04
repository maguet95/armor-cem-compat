# Armor CEM Compat

**Hace que los packs de armadura 3D (CEM) dejen de romper la armadura de los mods.**

Fabric · Minecraft 1.21.11 · solo cliente · 10 KB · MIT

---

## El problema

Instalas un resource pack de armadura 3D (CEM) y la armadura de **cualquier mod** se ve
deformada: colores fuera de sitio, manchas y huecos por los que se ve la piel. La vanilla se
ve bien. Y no es cosmético: **bloquea el modpack**, porque ningún tier de armadura nuevo se
puede añadir sin que entre roto.

La causa es que un `*_chestplate.jem` no describe *"el peto de diamante"*: describe **la capa
de armadura de la entidad**, venga del item que venga. Como el pack usa texturas 64×64 y toda
armadura de mod usa el layout vanilla 64×32, las UV se comprimen y leen la zona equivocada.

**EMF no ofrece forma de filtrar eso.** Su propiedad `items` llega vacía en las capas de
armadura — se demuestra en un renglón: `items=none` coincide *teniendo armadura puesta*.

## Qué hace este mod

Arregla los tres eslabones que impedían la solución:

| # | Problema | Solución |
|---|---|---|
| 1 | `items=` llega vacío en capas de armadura | añade la propiedad **`armor_item`**, que lee `getItemBySlot(slot)` de la entidad viva — sin NBT, sin caché |
| 2 | ETF solo permite re-evaluar la primera vez que una regla coincide | mixin en `PropertiesRandomProvider.entityCanUpdate()` |
| 3 | El layer de armadura conserva el modelo obtenido al crear los renderers | mixin en `HumanoidArmorLayer.getArmorModel()` → fuerza `doVariantCheck` |

> El punto **3** es interesante por sí solo: sin él, **cualquier** variante de modelo de
> armadura en EMF no se actualiza hasta pulsar F3+T. Afecta a todo pack CEM con variantes.

## Uso

En el `.properties` de tu pack, junto al `.jem`:

```properties
models.1=2
armor_item.1=chest:minecraft:*_chestplate
```

Sintaxis:

```
armor_item.<n>=<slot>:<id>  [más patrones separados por espacio]

  slot : head | chest | legs | feet   (también helmet/chestplate/leggings/boots)
  id   : admite '*'; sin namespace se asume minecraft
  '!'  : niega el patrón
```

Ejemplos:

```properties
armor_item.1=head:minecraft:*_helmet head:minecraft:turtle_helmet
armor_item.1=chest:!advancednetherite:*
```

**`minecraft:*_chestplate` excluye cualquier mod por namespace**, incluidos los que se
instalen en el futuro. No hay lista que mantener.

### Estructura que espera EMF

```
player_chestplate.jem         variante 1 — modelo vanilla
player_chestplate2.jem        variante 2 — el modelo 3D del pack
player_chestplate.properties  la regla
```

⚠️ **El `.jem` base es obligatorio.** Sin él, EMF ni siquiera busca la variante 2. Se obtiene
poniendo `modelExportMode: ALL_LOG_AND_JEM` en la config de EMF, entrando al juego una vez y
recogiendo los `.jem` de `.minecraft/emf/export/`.

## Requisitos

- Fabric Loader 0.16+ · Minecraft 1.21.11 · Java 21
- **EMF** (Entity Model Features) y **ETF** (Entity Texture Features)

Si EMF/ETF no están, el mod no hace nada. Todo va envuelto en `try/catch`: no puede tumbar el
juego aunque cambie la API de ETF.

## Compilar

```bash
# 1. Pon los jars de EMF y ETF en libs/ (no se redistribuyen aquí):
#    https://modrinth.com/mod/entity-model-features
#    https://modrinth.com/mod/entitytexturefeatures
./gradlew build
# -> build/libs/armor-cem-compat-1.0.0.jar
```

## Cómo se llegó a esto

El diagnóstico completo — qué se probó, qué falló y por qué — está en
[**HALLAZGOS.md**](HALLAZGOS.md): ~15 experimentos con evidencia de log y bytecode, incluidas
las vías descartadas para que nadie las repita.

El caso de uso original y las reglas ya generadas para *Just 3D Armors HMI*:
[sangre-arcana-aportes](https://github.com/maguet95/sangre-arcana-aportes/tree/main/fixes/just3darmors-modded-armor)

## Licencia

MIT. Úsalo, modifícalo e inclúyelo en tu modpack sin pedir permiso.

Los mods mencionados pertenecen a sus autores; aquí no se redistribuye ninguno.
