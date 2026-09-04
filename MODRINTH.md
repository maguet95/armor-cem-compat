# Material para publicar en Modrinth

Todo listo para copiar y pegar. Crear en **https://modrinth.com/dashboard/projects** → *Create a project*.

---

## 1. Datos del proyecto

| Campo | Valor |
|---|---|
| **Name** | `Armor CEM Compat` |
| **Slug / URL** | `armor-cem-compat` |
| **Project type** | Mod |
| **Client side** | **Required** |
| **Server side** | **Unsupported** |
| **License** | MIT |
| **Source code** | `https://github.com/maguet95/armor-cem-compat` |
| **Issue tracker** | `https://github.com/maguet95/armor-cem-compat/issues` |

### Summary *(máx. 256 caracteres — este es el texto que más se lee)*

```
Fixes 3D armor resource packs breaking every modded armor. Adds the item condition EMF is missing, and makes armor models actually refresh in-game.
```

### Categories
- `utility` *(principal)*
- `optimization` *(secundaria, opcional)*

---

## 2. Descripción *(pegar en el editor, es Markdown)*

```markdown
# Armor CEM Compat

**Stop 3D armor resource packs from breaking every modded armor.**

## The problem

You install a 3D armor resource pack (CEM) and suddenly **every modded armor looks destroyed** —
misplaced colors, dark patches, and holes you can see the player's skin through. Vanilla armor
looks fine. Modded armor doesn't. All of it.

And it's not just cosmetic: **it blocks your modpack**. Any new armor tier you add comes in
broken, so you can't add progression or new dimensions.

Two details that make it hard to diagnose:

- **The inventory icon looks fine.** The bug only shows on *worn* armor (F5).
- It also affects **zombies, skeletons, piglins and armor stands** wearing modded armor.

## Why it happens

A `*_chestplate.jem` doesn't describe *"the diamond chestplate"*. It describes **the entity's
armor layer** — whatever item it comes from. So it captures modded armor too.

The pack's textures are **64×64**, but every modded armor uses the vanilla **64×32** layout. The
UVs get squeezed and read from the wrong place.

**And EMF had no way to filter that.** Its `items` property comes back **empty** on armor
layers. One-line proof: `items=none` *matches while you're wearing armor*.

## What this mod does

| # | Problem | Fix |
|---|---|---|
| 1 | `items=` is empty on armor layers | adds the **`armor_item`** property, reading `getItemBySlot(slot)` from the live entity — no NBT, no caching |
| 2 | ETF only allows re-evaluation the first time a rule matches | mixin on `PropertiesRandomProvider.entityCanUpdate()` |
| 3 | The armor layer keeps the model it got at startup | mixin on `HumanoidArmorLayer.getArmorModel()` |
| 4 | Writing 48 rules by hand | **ships a built-in resource pack** with them ready |

> **Point 3 matters on its own:** without this mod, **any** EMF armor model variant won't
> update until you press F3+T. The armor you see is whichever you were wearing when you joined
> the world. That affects every CEM armor pack using variants.

## Installation

1. Drop the jar into your `mods/` folder
2. Install your 3D armor pack **as-is — don't modify it**
3. That's it

The mod ships a resource pack called *"Compat de armadura 3D con mods"* that enables itself and
sits above your armor pack. **Nothing to copy or move.**

**Requires:** [EMF](https://modrinth.com/mod/entity-model-features) and
[ETF](https://modrinth.com/mod/entitytexturefeatures) — the same ones any CEM pack already needs.

### If modded armor still looks wrong

Check in *Options → Resource Packs* that **"Compat de armadura 3D con mods" is above** your armor
pack, then **restart the game** — reloading isn't enough, because EMF doesn't rebuild armor
models on the fly. It's placed correctly by default.

### When to disable the built-in pack

You can disable it and the mod still works (the `armor_item` property stays). Do it if:

- **Your armor pack already ships its own rules** — ours would override them
- **Your pack already uses its own variants** (`<model>2.jem`) — they'd collide
- **You want to write your own rules**

## `armor_item` syntax

```properties
models.1=2
armor_item.1=chest:minecraft:*_chestplate
```

```
armor_item.<n>=<slot>:<id>  [more patterns, space separated]

  slot : head | chest | legs | feet   (also helmet/chestplate/leggings/boots)
  id   : supports '*'; namespace defaults to minecraft
  '!'  : negates the pattern — goes BEFORE the slot
```

```properties
armor_item.1=head:minecraft:*_helmet head:minecraft:turtle_helmet
armor_item.1=!chest:minecraft:*_chestplate
```

**`minecraft:*_chestplate` excludes any mod by namespace** — including ones installed later.
No list to maintain.

## Tested with

Just 3D Armors HMI 1.4 + Advanced Netherite, on Fabric 1.21.11 with EMF 3.3.5 and ETF 7.2.1.

Works with other CEM armor packs in principle — the file names are defined by EMF, not by the
pack author. If you try it with another pack, please let me know how it went.

## Credits

Full write-up of the investigation — including everything that was tried and ruled out — is in
[HALLAZGOS.md](https://github.com/maguet95/armor-cem-compat/blob/main/HALLAZGOS.md).

Thanks to **Traben** for EMF and ETF, and to **nagi** for Just 3D Armors.

---

*Licensed MIT. Use it, modify it, bundle it in your modpack — no permission needed.*
```

---

## 3. Versión a subir

| Campo | Valor |
|---|---|
| **Version number** | `1.1.0` |
| **Version title** | `1.1.0 — built-in compat pack` |
| **Release channel** | Release |
| **Loaders** | Fabric |
| **Game versions** | 1.21.11 |
| **Archivo** | `armor-cem-compat-1.1.0.jar` |

### Dependencies *(añadir las dos)*

| Proyecto | Tipo |
|---|---|
| `entity-model-features` (EMF) | **Required** |
| `entitytexturefeatures` (ETF) | **Required** |

> No añadas Fabric API como required: el mod no la usa directamente salvo por el resource
> loader, que ya viene con ella. Si quieres ser estricto, ponla como **Required** también.

### Changelog *(pegar)*

```markdown
## 1.1.0

**Your armor pack no longer needs to be modified.**

- Ships a **built-in resource pack** with the 48 compatibility rules, enabled by default.
  Install your armor pack as-is.
- Installation is now **a single file** in `mods/`.
- The built-in pack is **disableable**: if your armor pack ships its own rules, ours would
  override them — turn it off and keep the `armor_item` property, which those rules still need.

Main benefit: you can now **update your armor pack from Modrinth normally**, without
re-patching it every time.

## 1.0.0

First release.

- **`armor_item`** property for EMF/ETF `.properties`, reading worn armor directly from the
  entity (no NBT, no caching). Supports wildcards, multiple patterns and `!` negation.
- Mixin on `PropertiesRandomProvider.entityCanUpdate()` to unblock re-evaluation of
  equipment-dependent conditions.
- Mixin on `HumanoidArmorLayer.getArmorModel()` so armor models refresh their variant in-game —
  without it, they don't update until you press F3+T.
```

---

## 4. Galería *(las capturas)*

Sube al menos **dos**, y que la primera sea la del bug — es la que hace que alguien diga
*"¡eso es justo lo que me pasa!"*.

| Orden | Qué | Título sugerido |
|---|---|---|
| 1 | Armadura de mod **rota** (la de netherita deformada) | `Modded armor without the fix` |
| 2 | La misma armadura **correcta** | `Same armor with the mod installed` |
| 3 | Armadura vanilla con el 3D intacto | `Vanilla armor keeps the pack's 3D model` |

> Las tienes en el chat de ayer. Si quieres unas mejores, vale la pena rehacerlas: **misma
> posición, misma luz, mismo fondo** en el antes y el después. Un antes/después limpio vende
> el mod solo.

---

## 5. Antes de darle a publicar

- [ ] Icono del proyecto *(un cuadrado simple; sirve un peto con un check)*
- [ ] Summary revisado — es lo que más se lee
- [ ] Descripción pegada y previsualizada
- [ ] Las dos dependencias añadidas
- [ ] Capturas subidas, la del bug primero
- [ ] Enlaces a GitHub puestos
- [ ] Licencia MIT
- [ ] **Publicar en tu cuenta**, no en la organización de nadie

## 6. Después de publicar

- [ ] Pasarle el enlace a tu amigo para que lo declare como dependencia en su modpack
      *(así el crédito aparece solo en la página del modpack)*
- [ ] Enviar el mensaje a **nagi** (ver `MENSAJES.md`)
- [ ] Abrir el issue a **Traben** (ver `MENSAJES.md`) y enlazar la página de Modrinth
- [ ] Anotar en `PENDIENTES.md` los packs que la gente reporte que funcionan

---

## Nota: soporte de versiones

Ahora mismo solo funciona en **1.21.11** — los mappings y la API de EMF cambian entre
versiones. Eso limita la audiencia.

Si el mod tiene tracción, la primera mejora útil no es añadir funciones, sino **soportar más
versiones de Minecraft**. Vale la pena esperar a ver si alguien lo pide antes de invertir ahí.
