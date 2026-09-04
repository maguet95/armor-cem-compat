# Pendientes

## 1. Investigar con qué otros packs funciona (y documentarlo con ejemplos)

El parche es **genérico**: los nombres de archivo (`player_chestplate.jem`,
`zombie_helmet.jem`…) los define **EMF**, no el autor del pack. Así que en teoría cualquier
pack de armadura 3D con CEM tiene el mismo bug y se arregla igual.

**Falta comprobarlo pack por pack** y poner ejemplos concretos en el README y en Modrinth
("probado con: X, Y, Z"). Eso da mucha más confianza a quien lo instala.

Candidatos a probar (buscar en Modrinth "3D armor", "armor CEM", "3d armour"):
- Just 3D Armors HMI ✅ **verificado**
- Just 3D Armors Punchy! (1.21 Backport) — mismo autor, probable
- Otros packs de armadura 3D basados en CEM/OptiFine
- Packs de Fresh Animations que incluyan armadura

**Cómo probar cada uno**, rápido:
1. Instalar el pack + el mod
2. Ponerse armadura vanilla → debe verse el 3D del pack
3. Ponerse armadura de un mod (ej. Advanced Netherite) → debe verse normal
4. Cambiar en vivo → debe actualizarse al instante

**Casos donde NO aplicaría** (documentar también):
- Packs que ya usen variantes propias (`...2.jem`) → colisionaría con el parche integrado;
  para eso el pack integrado es desactivable.
- Packs que no usen CEM de armadura (solo texturas) → no tienen este bug.

## 2. Publicar en Modrinth
El mod y el parche son 100% propios, no hace falta permiso de nadie. Falta redactar la
página y decidir si se publica el parche por separado o solo integrado.

## 3. Enviar los mensajes
Ver MENSAJES.md: nagi (Discord) y Traben (issue). Esperar a que el amigo confirme que
funciona en su modpack real de ~300 mods.

## 4. Portar a NeoForge / Forge (si hay demanda)

**EMF y ETF existen para `fabric`, `neoforge`, `quilt` y `forge`** (todos con 1.21.11), así que
el bug afecta también a esas comunidades. La audiencia potencial es bastante mayor.

**Coste estimado: bajo.** La mayor parte del código ya es agnóstica del loader:

| Parte | ¿Cambia al portar? |
|---|---|
| `ArmorItemProperty` | **No** — solo usa clases de Minecraft y de ETF |
| Los dos mixins | **No** — Mixin es común a todos los loaders |
| Punto de entrada | Sí — `ClientModInitializer` → equivalente de NeoForge |
| Registro del pack integrado | Sí — la API de packs integrados es distinta |
| Manifiesto y build | Sí — `fabric.mod.json` → `neoforge.mods.toml` |

**Decisión: esperar a que alguien lo pida.**
Publicar una versión NeoForge sin probarla en condiciones es peor que no publicarla — el primer
contacto de esa comunidad con el mod solo ocurre una vez. Y probarla bien exige montar otra
instancia con NeoForge, otro pack de armadura 3D y otro mod de armadura.

**Cómo medir la demanda:** los comentarios de Modrinth. Si aparece gente preguntando por
NeoForge, merece la pena. Si no, se ahorró el trabajo.
