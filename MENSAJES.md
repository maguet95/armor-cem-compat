# Mensajes listos para enviar

---

## 1. Para tu amigo (modpack Living Vanilla) — español

> **Fix del bug de armadura — versión final** 🛡️
>
> Es **un solo archivo**: `armor-cem-compat-1.1.0.jar` → carpeta **`mods/`**
>
> Y el pack de armadura se instala **tal cual de Modrinth, sin modificar**. Ya no hace falta
> el `.zip` parcheado que te pasé antes.
>
> **Si ya instalaste lo anterior:**
> 1. Borra de `resourcepacks/` el `Just 3d armors 1.4 [compat mods].zip`
> 2. Pon el `Just 3d armors 1.4.zip` **original** de Modrinth
> 3. Copia este `.jar` a `mods/` (reemplaza el anterior)
>
> Cero configuración. El mod trae dentro un paquete de recursos ("Compat de armadura 3D con
> mods") que se activa solo. Necesita EMF y ETF, que ya los tienes.
>
> **La ventaja:** ahora puedes actualizar el pack de armadura desde Modrinth como cualquier
> otro, sin que haya que volver a parchearlo cada vez.
>
> Con esto ya puedes meter todas las armaduras y dimensiones que quieras: las de mods se ven
> normales y las vanilla mantienen el 3D de nagi, sin tocarle un píxel al pack.
>
> **Si alguna vez la armadura de mods se ve mal:** comprueba en *Opciones → Paquetes de
> recursos* que "Compat de armadura 3D con mods" esté **por encima** del pack de armadura, y
> **reinicia** el juego (recargar no basta). Viene bien puesto por defecto.
>
> Qué era, por si te interesa: el pack de armadura aplicaba su modelo 3D a **toda** armadura
> equipada, también la de los mods, que usan otro mapa de textura. Y EMF no ofrecía forma de
> filtrarlo, así que hubo que añadírsela.
>
> https://github.com/maguet95/armor-cem-compat

---

## 2. Para nagi (Discord de Whimscape) — español

> ¡Hola! Soy amigo de un dev de modpacks y hemos estado usando **Just 3D Armors HMI** en uno
> (Fabric 1.21.11). Nos topamos con el bug de las armaduras de mods —el que ya conoces— y en
> vez de quitar el pack nos pusimos a investigarlo a fondo. **Lo resolvimos**, y te traemos la
> causa exacta y la solución, por si te sirve.
>
> **No te pedimos nada ni hemos tocado tu pack**: lo que hicimos es un mod aparte, y tu pack
> se instala tal cual sale de Modrinth. Solo queríamos que lo supieras.
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
> actualiza al cambiarte de armadura hasta que pulsas F3+T. Eso último es un bug de EMF que
> también afecta a cualquier pack con variantes.
>
> **La solución.** Un mod cliente de 53 KB que añade la condición que faltaba (`armor_item`) y
> destraba los dos cachés que impedían actualizar el modelo. Tu pack queda **intacto**: se
> instala el original y el mod hace el resto.
>
> https://github.com/maguet95/armor-cem-compat
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

## 3. Para Traben (issue en Entity_Model_Features) — inglés

**Título:** `Armor CEM: items property is empty, and armor models never refresh variants in-game`

> Hi! While making a 3D armor CEM pack work alongside modded armor, I ran into three separate
> issues in EMF/ETF. I've implemented a working fix for all three and released it as a small
> client mod — happy to open a PR if you'd rather have any of it upstream.
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
> **What I did** (53 KB client mod, MIT):
> - registered an `armor_item` property via `ETFApi.registerCustomRandomPropertyFactory`,
>   reading `((LivingEntity) state.entity()).getItemBySlot(slot)` — no NBT, no caching
> - mixin on `PropertiesRandomProvider.entityCanUpdate()` → `true`
> - mixin on `HumanoidArmorLayer.getArmorModel()` → calls `doVariantCheck`, using
>   `EMFEntityRenderState.from(state)` since `HumanoidRenderState` doesn't implement it
> - ships the rules as a built-in resource pack, so the armor pack stays untouched
>
> Result: vanilla armor keeps the pack's 3D model, modded armor renders correctly, and
> switching armor updates instantly.
>
> **Two more things worth documenting:**
> - **The base `.jem` is required** for variants to be found — `<name>2.jem` is never looked up
>   unless `<name>.jem` exists, even with `enforceOptifineVariationRequiresDefaultModel = false`.
>   The changelog suggests otherwise. A base `.jem` with `"models": []` works nicely as
>   "variant 1 = vanilla".
> - A `.properties` from a **higher-priority pack** does get associated with a `.jem` from a
>   lower one (good — that's what makes a compat pack possible), but not the other way around.
>
> Full write-up, source and the mod:
> https://github.com/maguet95/armor-cem-compat
>
> Thanks for EMF — it's a great mod and this was a pleasure to dig into.
