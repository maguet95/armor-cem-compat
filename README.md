# Armor CEM Compat

**Hace que los packs de armadura 3D (CEM) dejen de romper la armadura de los mods.**

Fabric · Minecraft 1.21.11 · solo cliente · 53 KB · MIT

**Un solo archivo en `mods/`. Sin configurar nada.**

---

## El problema

Instalas un resource pack de armadura 3D (CEM) y la armadura de **cualquier mod** se ve
deformada: colores fuera de sitio, manchas y huecos por los que se ve la piel. La vanilla se
ve bien. Y no es cosmético: **bloquea el modpack**, porque ningún tier de armadura nuevo se
puede añadir sin que entre roto.

La causa es que un `*_chestplate.jem` no describe *"el peto de diamante"*: describe **la capa
de armadura de la entidad**, venga del item que venga. Como el pack usa texturas 64×64 y toda
armadura de mod usa el layout vanilla 64×32, las UV se comprimen y leen la zona equivocada.

**Y EMF no ofrecía forma de filtrar eso.** Su propiedad `items` llega vacía en las capas de
armadura — se demuestra en un renglón: `items=none` coincide *teniendo armadura puesta*.

## Qué hace

| # | Problema | Solución |
|---|---|---|
| 1 | `items=` llega vacío en capas de armadura | añade la propiedad **`armor_item`**, que lee `getItemBySlot(slot)` de la entidad viva — sin NBT, sin caché |
| 2 | ETF solo permite re-evaluar la primera vez que una regla coincide | mixin en `PropertiesRandomProvider.entityCanUpdate()` |
| 3 | El layer de armadura conserva el modelo obtenido al crear los renderers | mixin en `HumanoidArmorLayer.getArmorModel()` → fuerza `doVariantCheck` |
| 4 | Escribir las reglas a mano para 12 entidades × 4 piezas | **trae un resource pack integrado** con las 48 reglas ya hechas |

> El punto **3** es interesante por sí solo: sin él, **cualquier** variante de modelo de
> armadura en EMF no se actualiza hasta pulsar F3+T. Afecta a todo pack CEM con variantes.

## Instalación

1. Copia el `.jar` a tu carpeta **`mods/`**
2. Instala tu pack de armadura 3D **tal cual**, sin modificarlo
3. Listo

El mod trae dentro un resource pack llamado **"Compat de armadura 3D con mods"** que se activa
solo y aparece por encima de tu pack de armadura. **No hay que copiar ni mover nada.**

**Requisitos:** Fabric Loader 0.16+ · Java 21 · **EMF** y **ETF** (los mismos que ya necesita
cualquier pack CEM).

### ⚠️ Si la armadura de mods se sigue viendo mal

Comprueba en *Opciones → Paquetes de recursos* que **"Compat de armadura 3D con mods" esté por
encima** de tu pack de armadura, y **reinicia el juego** (no basta con recargar: EMF no
reconstruye los modelos de armadura en caliente).

Viene bien colocado por defecto; esto solo aplica si has reordenado los packs.

## 🔌 Cuándo desactivar el pack integrado

El pack integrado se puede desactivar y **el mod sigue funcionando** — la propiedad
`armor_item` se mantiene. Desactívalo si:

- **Tu pack de armadura ya trae sus propias reglas.** Si el autor lo arregló por su cuenta,
  las nuestras se las pisarían al ir por encima. Apaga el pack integrado y quedan las suyas
  (que siguen necesitando el mod para que `armor_item` exista).
- **Tu pack ya usa variantes propias** (`<modelo>2.jem`). Habría colisión.
- **Quieres escribir tus propias reglas**, más finas que las que trae.

En cualquier otro caso, déjalo como viene.

## Sintaxis de `armor_item`

```properties
models.1=2
armor_item.1=chest:minecraft:*_chestplate
```

```
armor_item.<n>=<slot>:<id>  [más patrones separados por espacio]

  slot : head | chest | legs | feet   (también helmet/chestplate/leggings/boots)
  id   : admite '*'; sin namespace se asume minecraft
  '!'  : niega el patrón — va DELANTE del slot
```

Ejemplos:

```properties
armor_item.1=head:minecraft:*_helmet head:minecraft:turtle_helmet
armor_item.1=!chest:minecraft:*_chestplate
```

**`minecraft:*_chestplate` excluye cualquier mod por namespace**, incluidos los que se
instalen en el futuro. No hay lista que mantener.

### Estructura que espera EMF

```
player_chestplate.jem         variante 1 — el modelo del pack
player_chestplate2.jem        variante 2 — modelo vanilla   (lo aporta este mod)
player_chestplate.properties  la regla                      (lo aporta este mod)
```

⚠️ **El `.jem` base es obligatorio.** Sin él, EMF ni siquiera busca la variante 2. Se obtiene
poniendo `modelExportMode: ALL_LOG_AND_JEM` en la config de EMF, entrando al juego una vez y
recogiendo los `.jem` de `.minecraft/emf/export/`.

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

Probado con **Just 3D Armors HMI 1.4** + Advanced Netherite en Fabric 1.21.11.
Ver también [PENDIENTES.md](PENDIENTES.md) para otros packs por verificar.

## Licencia

MIT. Úsalo, modifícalo e inclúyelo en tu modpack sin pedir permiso.

Los mods y packs mencionados pertenecen a sus autores; aquí no se redistribuye ninguno.
