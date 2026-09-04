# Mensajes listos para enviar

---

## 1. Para nagi (Discord de Whimscape) — español

> ¡Hola! Soy amigo de un dev de modpacks y hemos estado usando **Just 3D Armors HMI** en uno
> (Fabric 1.21.11). Nos topamos con el bug de las armaduras de mods —el que ya conoces— y en
> vez de quitarlo nos pusimos a investigarlo a fondo. **Lo resolvimos**, y te traemos tanto la
> causa exacta como el arreglo, por si te sirve.
>
> **La causa.** Los `.jem` de `optifine/cem/` no describen "el peto de diamante": describen la
> capa de armadura de la entidad, así que capturan también las armaduras de otros mods. Como
> ninguno declara `"texture"`, heredan la del item equipado; y como tus texturas son 64×64
> mientras toda armadura de mod usa el layout vanilla 64×32, las UV se comprimen y leen la
> zona equivocada. Lo medimos: 56 de 180 caras (31%) caen en la mitad inferior del lienzo, que
> en una textura de mod no existe, y 43 caen en zona transparente — de ahí los huecos.
>
> **Por qué no se podía arreglar con un `.properties`.** Lo intentamos todo. La propiedad
> `items` de EMF **llega vacía** en las capas de armadura; se demuestra en un renglón:
> `items=none` coincide *teniendo armadura puesta*. Y aunque uses NBT, el modelo no se
> actualiza al cambiarte de armadura hasta que pulsas F3+T.
>
> **La solución.** Escribimos un mod cliente de 10 KB que añade la condición que faltaba
> (`armor_item`) y destraba los dos cachés que impedían actualizar el modelo. Con eso tu pack
> funciona **sin modificar ni un píxel** de tu arte: la armadura vanilla mantiene tu 3D y la
> de mods se ve correcta.
>
> https://github.com/maguet95/sangre-arcana-aportes/tree/main/fixes/just3darmors-modded-armor
>
> **Y una opción mejor, que solo puedes hacer tú.** Si algún día remapeas las UV de tu modelo
> al layout vanilla 64×32, no haría falta ningún mod **y las armaduras de mods heredarían tu
> 3D** con sus propios colores. Y hay buenas noticias: tu geometría base ya es compatible —la
> caja del torso es idéntica a la vanilla, solo cambia el `sizeAdd`— y el **69% de las caras
> ya está en rango**. Serían unas 56 caras a reubicar en Blockbench. Te pasamos las
> coordenadas de referencia si te animas.
>
> Aparte: el pack incluye `assets/minecraft/shaders/core/`. Los core shaders son globales y
> solo uno puede ganar, así que cualquier otro pack que los sobrescriba (Fresh Animations y
> similares) entra en conflicto silencioso. No causa este bug, pero quizá valga mencionarlo en
> la página del pack.
>
> Todo con muchísimo respeto por tu trabajo — el pack es precioso y por eso queríamos que
> funcionara con mods en vez de tener que quitarlo. Cualquier cosa, aquí estamos.

---

## 2. Para Traben (GitHub issue en Entity_Model_Features) — inglés

**Título:** `Armor CEM: items property is empty, and armor models never refresh variants in-game`

> Hi! While making a 3D armor CEM pack work alongside modded armor, I ran into three separate
> issues in EMF/ETF. I've implemented a working fix for all three and I'm happy to open a PR
> if you want it upstream — but you'll almost certainly do it better from inside.
>
> **Environment:** Fabric 1.21.11, EMF 3.3.5, ETF 7.2.1.
>
> **Context.** An armor `*_chestplate.jem` applies to the entity's armor layer, not to a
> specific item, so it also captures modded armor — which uses the vanilla 64×32 layout while
> the pack's textures are 64×64. The result is badly distorted armor. There's currently no way
> for a pack author to scope a CEM armor model to specific items.
>
> **1. `items` is empty when evaluating armor layers.**
> One-line repro: `items.1=none` **matches while the entity is wearing armor**. Consistently,
> `items.1=any` never matches and item lists never match. So no item-based condition can work
> on armor layers. This is also why the workaround suggested in #347 doesn't help.
>
> **2. `entityCanUpdate(UUID)` blocks re-evaluation of state-dependent conditions.**
> `RandomPropertyRule` only calls `entityCanUpdate.put(uuid, true)` when a rule *matches*, so a
> condition that depends on changing state (like equipment) can get stuck. Measured: property
> evaluations went from **4 (only on join)** to **400+/s** after forcing it to `true`.
>
> **3. Armor models never refresh their variant in-game.** ← the important one
> `HumanoidArmorLayer` keeps the model instance it obtained when renderers were built, so
> `setVariantStateTo()` has no visible effect. **The armor you see is whichever you were
> wearing when you joined the world.** It self-corrects on F3+T or when opening the inventory,
> because both cause the model to be requested again. Reproducible with any CEM armor pack
> using variants — no custom property needed.
>
> **What I did** (10 KB client mod, MIT):
> - registered an `armor_item` property via `ETFApi.registerCustomRandomPropertyFactory`,
>   reading `((LivingEntity) state.entity()).getItemBySlot(slot)` — no NBT, no caching
> - mixin on `PropertiesRandomProvider.entityCanUpdate()` → `true`
> - mixin on `HumanoidArmorLayer.getArmorModel()` → calls `doVariantCheck`, using
>   `EMFEntityRenderState.from(state)` since `HumanoidRenderState` doesn't implement it
>
> Result: vanilla armor keeps the pack's 3D model, modded armor renders correctly, and
> switching armor updates instantly.
>
> Also possibly worth documenting: **the base `.jem` is required** for variants to be found —
> `<name>2.jem` is never looked up unless `<name>.jem` exists, even with
> `enforceOptifineVariationRequiresDefaultModel = false`. The changelog suggests otherwise.
> A base `.jem` with `"models": []` works nicely as "variant 1 = vanilla".
>
> Full write-up, source and the mod:
> https://github.com/maguet95/armor-cem-compat
>
> Thanks for EMF — it's a great mod and this was a pleasure to dig into.

---

## 3. Para el amigo (modpack Living Vanilla) — español

> **Fix del bug de armadura** 🛡️
>
> Son 2 archivos y hacen falta **los dos**:
> - `armor-cem-compat-1.0.0.jar` → carpeta **`mods/`**
> - `Just 3d armors 1.4 [compat mods].zip` → carpeta **`resourcepacks/`**, **reemplazando** al
>   `Just 3d armors 1.4.zip` original (borra el viejo, no dejes los dos o se pisan)
>
> Cero configuración. Con esto ya puedes meter todas las armaduras y dimensiones que quieras:
> las de mods se ven normales y las vanilla mantienen el 3D de nagi, sin tocarle un píxel al pack.
>
> El mod es de cliente, 10 KB, y va envuelto en try/catch para que no pueda tumbar el modpack.
> Necesita EMF y ETF, que ya los tienes.
>
> Qué era, por si te interesa: el pack de armadura aplicaba su modelo 3D a **toda** armadura
> equipada, también la de los mods, que usan otro mapa de textura. Y EMF no ofrecía forma de
> filtrarlo, así que hubo que añadírsela.
>
> Explicación completa 👇
> https://github.com/maguet95/sangre-arcana-aportes/tree/main/fixes/just3darmors-modded-armor
