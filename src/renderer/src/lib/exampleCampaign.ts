import { sub, add } from 'date-fns'
import type {
  Campaign,
  Character,
  Location,
  Faction,
  Item,
  Lore,
  Note,
  Document,
  Session,
  Scene,
  Tag,
  GameRule,
  PlanningSection,
  Combatant
} from '@/types'

export interface ExampleCampaignData {
  campaigns: Campaign[]
  characters: Character[]
  locations: Location[]
  factions: Faction[]
  items: Item[]
  lore: Lore[]
  notes: Note[]
  documents: Document[]
  sessions: Session[]
  scenes: Scene[]
  tags: Tag[]
  gameRules: GameRule[]
}

export function generateExampleCampaign(): ExampleCampaignData {
  const now = new Date()
  const ts = now.toISOString()
  const weekAgo = sub(now, { days: 7 }).toISOString()
  const weekFromNow = add(now, { days: 7 }).toISOString()

  // Pre-generate all IDs for cross-referencing
  const id = {
    campaign: crypto.randomUUID(),
    // Characters — PCs
    tav: crypto.randomUUID(),
    shadowheart: crypto.randomUUID(),
    astarion: crypto.randomUUID(),
    gale: crypto.randomUUID(),
    // Characters — NPCs
    withers: crypto.randomUUID(),
    volo: crypto.randomUUID(),
    jaheira: crypto.randomUUID(),
    ravengard: crypto.randomUUID(),
    // Characters — Monsters
    cazador: crypto.randomUUID(),
    orin: crypto.randomUUID(),
    ketheric: crypto.randomUUID(),
    // Locations
    baldursGate: crypto.randomUUID(),
    elfsong: crypto.randomUUID(),
    moonrise: crypto.randomUUID(),
    grymforge: crypto.randomUUID(),
    emeraldGrove: crypto.randomUUID(),
    creche: crypto.randomUUID(),
    shadowCursedLands: crypto.randomUUID(),
    cazadorPalace: crypto.randomUUID(),
    // Factions
    harpers: crypto.randomUUID(),
    cultAbsolute: crypto.randomUUID(),
    zhentarim: crypto.randomUUID(),
    // Items
    swordOfJustice: crypto.randomUUID(),
    necromancyOfThay: crypto.randomUUID(),
    infernalRapier: crypto.randomUUID(),
    staffOfCrones: crypto.randomUUID(),
    amuletOfSelune: crypto.randomUUID(),
    potionOfSpeed: crypto.randomUUID(),
    hellfireCrossbow: crypto.randomUUID(),
    infernalEngineNotes: crypto.randomUUID(),
    // Lore
    deadThree: crypto.randomUUID(),
    absoluteElderBrain: crypto.randomUUID(),
    shadowCurse: crypto.randomUUID(),
    avernus: crypto.randomUUID(),
    bhaalProphecy: crypto.randomUUID(),
    githyankiCreche: crypto.randomUUID(),
    // Notes
    noteArcOutline: crypto.randomUUID(),
    noteCazadorWeakness: crypto.randomUUID(),
    noteNpcRelationships: crypto.randomUUID(),
    noteBackstoryHooks: crypto.randomUUID(),
    noteTadpolePowers: crypto.randomUUID(),
    // Documents
    docJaheiraLetter: crypto.randomUUID(),
    docThayScroll: crypto.randomUUID(),
    docOrinJournal: crypto.randomUUID(),
    // Sessions
    session1: crypto.randomUUID(),
    session2: crypto.randomUUID(),
    // Scenes
    s1scene1: crypto.randomUUID(),
    s1scene2: crypto.randomUUID(),
    s1scene3: crypto.randomUUID(),
    s2scene1: crypto.randomUUID(),
    s2scene2: crypto.randomUUID(),
    // Tags
    tagMainQuest: crypto.randomUUID(),
    tagSideQuest: crypto.randomUUID(),
    tagLoot: crypto.randomUUID(),
    tagSecret: crypto.randomUUID(),
    tagHandout: crypto.randomUUID(),
    // Planning sections
    s1ps1: crypto.randomUUID(),
    s1ps2: crypto.randomUUID(),
    s1ps3: crypto.randomUUID(),
    s1ps4: crypto.randomUUID(),
    s2ps1: crypto.randomUUID(),
    s2ps2: crypto.randomUUID(),
    s2ps3: crypto.randomUUID(),
    s2ps4: crypto.randomUUID(),
    // Combatants
    comb1: crypto.randomUUID(),
    comb2: crypto.randomUUID(),
    comb3: crypto.randomUUID(),
    comb4: crypto.randomUUID(),
    comb5: crypto.randomUUID(),
    // Game rules
    grTadpole: crypto.randomUUID(),
    grInspiration: crypto.randomUUID()
  }

  // === CAMPAIGN ===
  const campaigns: Campaign[] = [
    {
      id: id.campaign,
      name: 'Descent into Avernus',
      description:
        'The city of Baldur\'s Gate teeters on the brink of being dragged into Avernus. A band of unlikely heroes — each infected with a mind flayer tadpole — must uncover a conspiracy orchestrated by the Dead Three and descend into the first layer of the Nine Hells to save the Sword Coast.',
      system: 'D&D 5e',
      setting: 'Faerûn',
      status: 'active',
      createdAt: weekAgo,
      updatedAt: ts
    }
  ]

  // === TAGS ===
  const tags: Tag[] = [
    { id: id.tagMainQuest, campaignId: id.campaign, name: 'Main Quest', color: '#6366f1', createdAt: weekAgo, updatedAt: weekAgo },
    { id: id.tagSideQuest, campaignId: id.campaign, name: 'Side Quest', color: '#f59e0b', createdAt: weekAgo, updatedAt: weekAgo },
    { id: id.tagLoot, campaignId: id.campaign, name: 'Loot', color: '#10b981', createdAt: weekAgo, updatedAt: weekAgo },
    { id: id.tagSecret, campaignId: id.campaign, name: 'Secret', color: '#8b5cf6', createdAt: weekAgo, updatedAt: weekAgo },
    { id: id.tagHandout, campaignId: id.campaign, name: 'Handout', color: '#06b6d4', createdAt: weekAgo, updatedAt: weekAgo }
  ]

  // === LOCATIONS ===
  const locations: Location[] = [
    {
      id: id.baldursGate, campaignId: id.campaign, name: "Baldur's Gate", type: 'city',
      description: "The great city on the Sword Coast, divided between the wealthy Upper City and the bustling Lower City. [[The Elfsong Tavern]] is a popular gathering spot. [[Duke Ravengard]] governs from the High Hall, though the city's politics grow ever more treacherous as the influence of the [[Cult of the Absolute]] spreads.",
      notableCharacterIds: [id.tav, id.gale, id.astarion, id.ravengard, id.volo],
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.elfsong, campaignId: id.campaign, name: 'The Elfsong Tavern', type: 'tavern',
      description: "A famous tavern in the Lower City of [[Baldur's Gate]], known for the ghostly elven voice that sings at night. A popular meeting place for adventurers, [[The Harpers]], and those seeking information. [[Volo]] can often be found here scribbling notes for his next book.",
      notableCharacterIds: [id.volo],
      tags: [], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.moonrise, campaignId: id.campaign, name: 'Moonrise Towers', type: 'dungeon',
      description: "A dark fortress in the [[Shadow-Cursed Lands]], serving as the headquarters of the [[Cult of the Absolute]]. [[Ketheric Thorm]] commands an army of undead from within its cursed walls. The towers are surrounded by a deathly shadow that drains the life from anything it touches.",
      notableCharacterIds: [id.ketheric],
      tags: [id.tagMainQuest, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.grymforge, campaignId: id.campaign, name: 'Grymforge', type: 'dungeon',
      description: "An ancient Sharran temple and duergar stronghold deep in the Underdark. The forge still burns with arcane fire, and the duergar mine for adamantine under the watchful eye of their masters. Connected to the [[Shadow-Cursed Lands]] via underground passages.",
      notableCharacterIds: [],
      tags: [id.tagSideQuest], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.emeraldGrove, campaignId: id.campaign, name: 'Emerald Grove', type: 'landmark',
      description: "A druid grove sheltering tiefling refugees from the nearby goblin raids. Protected by ancient druidic magic, the grove serves as a sanctuary — but tensions between druids and refugees threaten to tear it apart. [[Jaheira]] has connections to the druids here through [[The Harpers]].",
      notableCharacterIds: [id.jaheira],
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.creche, campaignId: id.campaign, name: "Crèche Y'llek", type: 'landmark',
      description: "A githyanki crèche hidden in the mountains of the Rosymorn Monastery. The githyanki warriors seek to purge the mind flayer tadpoles — but their methods involve a device that could kill the host. The crèche is heavily fortified and filled with psionic warriors.",
      notableCharacterIds: [],
      tags: [id.tagSideQuest], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.shadowCursedLands, campaignId: id.campaign, name: 'Shadow-Cursed Lands', type: 'region',
      description: "A vast stretch of land shrouded in magical darkness. The shadow curse was unleashed by [[Ketheric Thorm]] and kills or transforms any who enter without protection. [[Moonrise Towers]] sits at its heart. The land was once fertile and prosperous before the curse fell.",
      notableCharacterIds: [],
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.cazadorPalace, campaignId: id.campaign, name: "Cazador's Palace", type: 'dungeon',
      description: "The opulent yet horrifying lair of [[Cazador Szarr]], a vampire lord of [[Baldur's Gate]]. Hidden beneath the city, the palace conceals an ancient ritual chamber where Cazador plans to sacrifice his spawn — including [[Astarion]] — to ascend to a Vampire Ascendant.",
      notableCharacterIds: [id.cazador],
      tags: [id.tagSideQuest, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    }
  ]

  // === FACTIONS ===
  const factions: Faction[] = [
    {
      id: id.harpers, campaignId: id.campaign, name: 'The Harpers', alignment: 'Chaotic Good',
      description: "A secretive network of spellcasters and spies dedicated to promoting good, preserving history, and maintaining balance. [[Jaheira]] leads a cell operating out of [[Baldur's Gate]] and the surrounding wilds. They oppose the [[Cult of the Absolute]] and seek to uncover its true leadership.",
      goals: "Dismantle the Cult of the Absolute, protect the innocent, discover the true power behind the cult's leaders.",
      memberIds: [id.jaheira],
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.cultAbsolute, campaignId: id.campaign, name: 'Cult of the Absolute', alignment: 'Neutral Evil',
      description: "A rapidly growing cult that worships a mysterious deity known as the Absolute. In truth, the Absolute is an [[The Absolute & the Elder Brain|Elder Brain]] controlled by three Chosen of the Dead Three: [[Ketheric Thorm]], [[Orin the Red]], and [[Cazador Szarr]]'s ally. They use mind flayer tadpoles to dominate followers.",
      goals: 'Spread the influence of the Absolute, dominate the Sword Coast through mind control, and further the designs of the Dead Three.',
      memberIds: [id.ketheric, id.orin],
      tags: [id.tagMainQuest, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.zhentarim, campaignId: id.campaign, name: 'The Zhentarim', alignment: 'Lawful Evil',
      description: "A mercenary company and criminal network that operates throughout Faerûn. In [[Baldur's Gate]], they run smuggling operations and vie for control of the black market. While not allied with the [[Cult of the Absolute]], they're willing to profit from the chaos it creates.",
      goals: 'Expand trade operations (legal and illegal), gain influence in Baldur\'s Gate, and exploit the cult crisis for profit.',
      memberIds: [],
      tags: [id.tagSideQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    }
  ]

  // === CHARACTERS ===
  const characters: Character[] = [
    // PCs
    {
      id: id.tav, campaignId: id.campaign, name: 'Tav', type: 'player',
      race: 'Human', class: 'Paladin', level: 5, status: 'alive',
      locationId: id.baldursGate, factionId: '', hp: 45, armorClass: 18,
      description: 'A broad-shouldered human with a strong jaw, close-cropped dark hair, and a jagged scar across the left cheek. Wears gleaming plate armor emblazoned with the symbol of Tyr.',
      backstory: "A soldier of [[Baldur's Gate]] who served under [[Duke Ravengard]] before being captured by mind flayers aboard the Nautiloid. Now infected with a tadpole, Tav seeks a cure while upholding the oath of devotion. Has taken up the [[Sword of Justice]] found on the road to [[Emerald Grove]].",
      dmNotes: "Tav's tadpole is evolving faster than the others. The Absolute has taken special interest. Consider a dream sequence next session where the Elder Brain reaches out directly.",
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.shadowheart, campaignId: id.campaign, name: 'Shadowheart', type: 'player',
      race: 'Half-Elf', class: 'Cleric', level: 5, status: 'alive',
      locationId: id.baldursGate, factionId: '', hp: 38, armorClass: 16,
      description: 'A guarded half-elf with dark hair, sharp green eyes, and a perpetual air of secrecy. Wears the half-plate of a Sharran priestess and keeps a mysterious artifact close at all times.',
      backstory: "A devout cleric of Shar, the goddess of darkness. [[Shadowheart]] was on a mission to deliver the [[Amulet of Selûne]] to her superiors when she was captured by mind flayers. Her memories have been partially wiped by her own goddess, and she carries secrets even she doesn't fully understand. The party found her in a pod on the Nautiloid.",
      dmNotes: "Shadowheart's memories of the Sharran cloister are suppressed. If she visits [[Grymforge]], she may begin to recover fragments. Her parents are being held in the Shadowfell as leverage by Shar.",
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.astarion, campaignId: id.campaign, name: 'Astarion', type: 'player',
      race: 'High Elf', class: 'Rogue', level: 5, status: 'alive',
      locationId: id.baldursGate, factionId: '', hp: 33, armorClass: 15,
      description: 'A pale, silver-haired high elf with crimson eyes and an aristocratic bearing. His charming smile barely conceals the predatory nature beneath. Bears ritualistic scars carved into his back by his master.',
      backstory: "A vampire spawn who served [[Cazador Szarr]] for two centuries in [[Cazador's Palace]]. [[Astarion]] was freed from his master's direct control when the mind flayer tadpole disrupted the vampiric bond. Now he walks in sunlight for the first time in 200 years — though he still craves blood. The scars on his back are part of an infernal ritual he doesn't yet understand.",
      dmNotes: "The scars on Astarion's back are actually an infernal contract written in Infernal. Cazador needs to sacrifice 7,000 spawn (including Astarion) to complete the Rite of Profane Ascension. Astarion can choose to complete the ritual himself or destroy it.",
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.gale, campaignId: id.campaign, name: 'Gale', type: 'player',
      race: 'Human', class: 'Wizard', level: 5, status: 'alive',
      locationId: id.baldursGate, factionId: '', hp: 28, armorClass: 13,
      description: 'A handsome human wizard with warm brown eyes and a neatly trimmed beard. Carries himself with the confidence of a Waterdhavian intellectual, though there\'s an undercurrent of anxiety about him.',
      backstory: "A prodigious wizard of Waterdeep who once had a romantic relationship with Mystra, goddess of magic. [[Gale]] consumed a piece of the Karsite Weave — a fragment of destroyed magic — and now harbours a netherese destruction orb in his chest. He must periodically consume magical artifacts to keep it stable, or risk detonating with the force of a small sun. The [[Necromancy of Thay]] is the kind of artifact he might need.",
      dmNotes: "Mystra has reached out to Gale in dreams, asking him to sacrifice himself at the heart of the Absolute's power to destroy the Elder Brain. He hasn't told the party yet. The orb will destabilize in 3 sessions if not fed another artifact.",
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    // NPCs
    {
      id: id.withers, campaignId: id.campaign, name: 'Withers', type: 'npc',
      race: 'Undead', class: '', level: 20, status: 'alive',
      locationId: id.emeraldGrove, factionId: '', hp: 0, armorClass: 0,
      description: 'An ancient, desiccated undead figure wrapped in tattered burial cloths. Speaks in a dry, matter-of-fact tone and seems to know far more than he lets on.',
      backstory: "A mysterious undead being who appeared at the party's camp after they explored an ancient crypt. [[Withers]] offers to resurrect fallen companions for a modest fee of 200 gold. He asks philosophical questions about the worth of a single mortal life and seems to be observing the party with great interest.",
      dmNotes: 'Withers is actually Jergal, the former god of death who willingly gave up his portfolio to the Dead Three (Bane, Bhaal, Myrkul). He is watching the party to see if mortals can overcome what the gods set in motion.',
      tags: [id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.volo, campaignId: id.campaign, name: 'Volo', type: 'npc',
      race: 'Human', class: 'Bard', level: 4, status: 'alive',
      locationId: id.elfsong, factionId: '', hp: 22, armorClass: 11,
      description: "A flamboyant, slightly portly man with a feathered cap, an ever-present quill, and an unshakable belief in his own expertise. Author of Volo's Guide to Monsters.",
      backstory: "Volothamp Geddarm, famous author and self-proclaimed expert on all things, was found captive in the goblin camp near [[Emerald Grove]]. After being rescued, he now frequents [[The Elfsong Tavern]] in [[Baldur's Gate]], gathering material for his next book. He attempted to remove the party's tadpoles surgically — and accidentally removed [[Tav]]'s eye instead, replacing it with a magical prosthetic.",
      dmNotes: "Volo's prosthetic eye actually grants See Invisibility. He doesn't know this. Could be a fun reveal if the party encounters invisible enemies.",
      tags: [id.tagSideQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.jaheira, campaignId: id.campaign, name: 'Jaheira', type: 'npc',
      race: 'Half-Elf', class: 'Druid', level: 10, status: 'alive',
      locationId: id.emeraldGrove, factionId: id.harpers, hp: 65, armorClass: 14,
      description: 'A weathered half-elf druid with sharp features, auburn hair streaked with grey, and the bearing of someone who has seen too many wars. Her wild shape forms are battle-tested.',
      backstory: "A legendary Harper and hero of Baldur's Gate. [[Jaheira]] has fought against evil for decades, from the Bhaalspawn crisis to the current threat of the [[Cult of the Absolute]]. She leads a Harper cell from [[Emerald Grove]] and the surrounding area, coordinating intelligence on [[Moonrise Towers]] and the [[Shadow-Cursed Lands]].",
      dmNotes: "Jaheira suspects the Absolute is connected to the Dead Three from her experiences during the Bhaalspawn crisis. She hasn't shared this theory with the party yet — she needs proof first.",
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.ravengard, campaignId: id.campaign, name: 'Duke Ravengard', type: 'npc',
      race: 'Human', class: 'Fighter', level: 8, status: 'missing',
      locationId: id.moonrise, factionId: '', hp: 72, armorClass: 17,
      description: 'A stern, broad-shouldered man with a military bearing. His face is weathered by campaigns, and his armor bears the crest of the Flaming Fist.',
      backstory: "Grand Duke of [[Baldur's Gate]] and commander of the Flaming Fist mercenary company. [[Duke Ravengard]] marched to [[Moonrise Towers]] to investigate the [[Cult of the Absolute]] but has not returned. Intelligence suggests he's been captured and is being held within the towers, possibly under the influence of the Absolute.",
      dmNotes: 'Ravengard has been infected with a tadpole and is under the direct control of the Absolute. Freeing him requires either a Protection from Evil and Good spell or destroying the Absolute\'s influence at the source.',
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    // Monsters
    {
      id: id.cazador, campaignId: id.campaign, name: 'Cazador Szarr', type: 'monster',
      race: 'Undead (Vampire)', class: 'Wizard', level: 15, status: 'alive',
      locationId: id.cazadorPalace, factionId: '', hp: 136, armorClass: 16,
      description: 'A gaunt, pale elf with sunken cheeks, long dark hair, and eyes that burn with malevolent intelligence. His aristocratic clothing is centuries out of fashion.',
      backstory: "An ancient vampire lord who has ruled a network of spawn from [[Cazador's Palace]] beneath [[Baldur's Gate]] for centuries. [[Cazador Szarr]] is preparing the Rite of Profane Ascension, which requires the sacrifice of thousands of vampire spawn — including [[Astarion]], his most prized creation.",
      dmNotes: "Cazador's lair has 3 phases: the ballroom (social/deception), the dungeon (rescue spawn prisoners), and the ritual chamber (final fight). He has Legendary Actions and can summon spawn mid-fight. AC 16, 136 HP, CR 12.",
      tags: [id.tagSideQuest, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.orin, campaignId: id.campaign, name: 'Orin the Red', type: 'monster',
      race: 'Human (Bhaalspawn)', class: 'Rogue', level: 14, status: 'alive',
      locationId: id.baldursGate, factionId: id.cultAbsolute, hp: 120, armorClass: 17,
      description: 'A petite woman whose appearance shifts constantly — her true form features wild red hair, blood-red eyes, and ritual scarification covering every inch of skin. She speaks in a sing-song voice about murder as art.',
      backstory: "A Bhaalspawn and Chosen of Bhaal, the god of murder. [[Orin the Red]] is one of the three leaders of the [[Cult of the Absolute]], though she chafes under the arrangement. She's a shapeshifter who has infiltrated [[Baldur's Gate]] by replacing key figures. She threatens to kidnap someone the party cares about to force a confrontation in the Temple of Bhaal.",
      dmNotes: "Orin has already replaced a minor NPC the party has met (decide which one). She'll reveal this at the worst possible moment. Her temple is accessed through the sewers beneath Baldur's Gate.",
      tags: [id.tagMainQuest, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.ketheric, campaignId: id.campaign, name: 'Ketheric Thorm', type: 'monster',
      race: 'Undead (Human)', class: 'Paladin', level: 16, status: 'alive',
      locationId: id.moonrise, factionId: id.cultAbsolute, hp: 160, armorClass: 18,
      description: 'A massive, imposing figure clad in dark plate armor. His skin is grey and lifeless, his eyes glow with Myrkul\'s necrotic energy, and the shadow curse radiates from him like a shroud.',
      backstory: "Once a Selûnite paladin, [[Ketheric Thorm]] lost his faith after the death of his daughter. He turned to Myrkul, god of death, and became his Chosen. He unleashed the shadow curse on the [[Shadow-Cursed Lands]] and commands the undead army at [[Moonrise Towers]]. As a Chosen of the Absolute, he is functionally immortal — his soul is bound to a relic in the depths beneath the towers.",
      dmNotes: "Ketheric cannot be permanently killed until the party destroys the Nightsong (a bound celestial) in the Shadowfell pocket beneath Moonrise. Two-phase fight: first on the tower roof, then in the mind flayer colony below where he transforms into an Avatar of Myrkul.",
      tags: [id.tagMainQuest, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    }
  ]

  // === ITEMS ===
  const items: Item[] = [
    {
      id: id.swordOfJustice, campaignId: id.campaign, name: 'Sword of Justice', type: 'weapon',
      description: "A greatsword that radiates warm golden light. Found on the body of a fallen paladin on the road to [[Emerald Grove]]. Currently wielded by [[Tav]].",
      properties: '+1 greatsword, grants Tyr\'s Protection (cast Shield of Faith as a bonus action, 1/long rest)', value: '2,500gp',
      holderId: id.tav, tags: [id.tagLoot], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.necromancyOfThay, campaignId: id.campaign, name: 'The Necromancy of Thay', type: 'artifact',
      description: "A sinister tome bound in skin, with a dark gem set into its cover. Radiates powerful necromantic energy. Found in a hidden cellar in the blighted village. [[Gale]] has been eyeing it as a potential meal for his orb, but the book whispers of dark power to anyone who reads it.",
      properties: 'Requires DC 15 Wisdom save to open. Grants Speak with Dead (at will) if read. Can be consumed by Gale\'s orb. Sentient — resists destruction.',
      value: 'Priceless', holderId: id.gale, tags: [id.tagMainQuest, id.tagLoot, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.infernalRapier, campaignId: id.campaign, name: 'Infernal Rapier', type: 'weapon',
      description: "A wicked-looking rapier forged in Avernus. The blade seems to drink in light, and faint screams can be heard when it strikes. Wielded by [[Astarion]].",
      properties: '+1 rapier, deals an extra 1d6 fire damage, planar weapon (bypasses fiend resistances)', value: '3,000gp',
      holderId: id.astarion, tags: [id.tagLoot], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.staffOfCrones, campaignId: id.campaign, name: 'Staff of Crones', type: 'weapon',
      description: "A gnarled wooden staff topped with a hag's eye that blinks occasionally. Recovered from [[Grymforge]] after defeating the duergar.",
      properties: 'Arcane focus, Ray of Sickness (3/long rest, DC 14), Darkvision 60ft while held', value: '1,800gp',
      holderId: '', tags: [id.tagLoot, id.tagSideQuest], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.amuletOfSelune, campaignId: id.campaign, name: 'Amulet of Selûne', type: 'artifact',
      description: "A moonstone pendant that glows faintly in darkness. [[Shadowheart]] was tasked by the Sharran cult to steal this from the Selûnites. It holds power that could break — or strengthen — the shadow curse on the [[Shadow-Cursed Lands]].",
      properties: 'Unknown — requires Identify or experimentation. Reacts to moonlight and the shadow curse. Sharran magic cannot detect its true nature.',
      value: 'Priceless', holderId: id.shadowheart, tags: [id.tagMainQuest, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.potionOfSpeed, campaignId: id.campaign, name: 'Potion of Speed', type: 'consumable',
      description: "A swirling amber liquid that fizzes with energy. Purchased from a merchant in [[Baldur's Gate]].",
      properties: 'Gain effects of Haste for 1 minute (no concentration). After effects end, can\'t move or take actions until end of next turn.',
      value: '400gp', holderId: id.tav, tags: [id.tagLoot], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.hellfireCrossbow, campaignId: id.campaign, name: 'Hellfire Hand Crossbow', type: 'weapon',
      description: "A hand crossbow with fiendish engravings that glow red when fired. Taken from a Zhentarim operative who got on the wrong side of the party.",
      properties: '+1 hand crossbow, once per short rest: Scorching Ray (2 rays) as a bonus action after hitting with the crossbow', value: '2,800gp',
      holderId: id.astarion, tags: [id.tagLoot, id.tagSideQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.infernalEngineNotes, campaignId: id.campaign, name: "Karlach's Infernal Engine Notes", type: 'misc',
      description: "Hastily scribbled notes about infernal engine mechanics, collected from various sources. Useful for anyone trying to repair or modify an infernal machine — or understand how devils bind souls to constructs.",
      properties: 'Reference material. Grants advantage on Arcana checks related to infernal machinery.',
      value: '—', holderId: '', tags: [id.tagSideQuest], isPublic: false, createdAt: weekAgo, updatedAt: ts
    }
  ]

  // === LORE ===
  const lore: Lore[] = [
    {
      id: id.deadThree, campaignId: id.campaign, title: 'The Dead Three',
      category: 'religion', era: 'Time of Troubles',
      description: "**Bane** (tyranny), **Bhaal** (murder), and **Myrkul** (death) — three gods who once sought to steal the Tablets of Fate and were cast down to walk Faerûn as mortals during the Time of Troubles.\n\nAll three were slain and later resurrected in diminished forms. Now they work through their Chosen:\n\n- **Myrkul** acts through [[Ketheric Thorm]] at [[Moonrise Towers]]\n- **Bhaal** acts through [[Orin the Red]] in [[Baldur's Gate]]\n- **Bane** acts through a general yet to be revealed\n\nTogether, they have created the [[Cult of the Absolute]] as a front for their true scheme: domination of the Sword Coast through an enslaved Elder Brain.",
      relatedCharacterIds: [id.ketheric, id.orin], relatedLocationIds: [id.moonrise, id.baldursGate],
      relatedFactionIds: [id.cultAbsolute], relatedItemIds: [],
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.absoluteElderBrain, campaignId: id.campaign, title: 'The Absolute & the Elder Brain',
      category: 'history', era: 'Present Day',
      description: "The entity known as \"the Absolute\" is not a god at all — it is an **Elder Brain** that has been enslaved using a crown of Karsus Netherese design. The Dead Three ([[The Dead Three]]) control the Elder Brain through their Chosen, using it to produce specially modified mind flayer tadpoles that grant psychic powers to hosts without immediately transforming them.\n\nThe tadpoles serve as a network of control: anyone infected can be dominated through the Elder Brain. The party each carry one of these tadpoles, which grants them limited psychic abilities but puts them at constant risk of ceremorphosis (transformation into a mind flayer).\n\n> *\"The Absolute sees all who carry its gift. It whispers in the dark.\"*",
      relatedCharacterIds: [id.ketheric, id.orin], relatedLocationIds: [],
      relatedFactionIds: [id.cultAbsolute], relatedItemIds: [],
      tags: [id.tagMainQuest, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.shadowCurse, campaignId: id.campaign, title: 'The Shadow Curse',
      category: 'magic', era: 'Present Day',
      description: "A devastating magical blight that covers the [[Shadow-Cursed Lands]] in impenetrable darkness. The curse was unleashed by [[Ketheric Thorm]] when he bound the Nightsong — an aasimar daughter of Selûne — in the Shadowfell.\n\n**Effects of the curse:**\n- Non-magical light is extinguished within the affected area\n- Living creatures take 2d6 necrotic damage per round without magical light protection\n- Prolonged exposure transforms creatures into shadow-cursed undead\n- Plants wither and die, water turns black and poisonous\n\nThe [[Amulet of Selûne]] may hold the key to lifting the curse, as Selûne's light is the natural counter to Shar's darkness.",
      relatedCharacterIds: [id.ketheric], relatedLocationIds: [id.shadowCursedLands, id.moonrise],
      relatedFactionIds: [], relatedItemIds: [id.amuletOfSelune],
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.avernus, campaignId: id.campaign, title: 'Avernus & the Blood War',
      category: 'cosmology', era: '',
      description: "**Avernus** is the first layer of the Nine Hells — a blasted wasteland of scorched earth, rivers of blood, and perpetual warfare. It serves as the frontline of the **Blood War**, the eternal conflict between devils (lawful evil) and demons (chaotic evil).\n\nThe archdevil **Zariel** rules Avernus and commands its legions against the demonic hordes of the Abyss. Infernal war machines — powered by soul coins and infernal engines — thunder across the hellscape.\n\n**Relevance to the campaign:** The title \"Descent into Avernus\" refers to the possibility that [[Baldur's Gate]] itself may be dragged into Avernus, as Zariel has a connection to the city's past.",
      relatedCharacterIds: [], relatedLocationIds: [id.baldursGate],
      relatedFactionIds: [], relatedItemIds: [id.infernalRapier, id.infernalEngineNotes],
      tags: [id.tagMainQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.bhaalProphecy, campaignId: id.campaign, title: "Prophecy of Bhaal's Return",
      category: 'prophecy', era: '',
      description: "An ancient prophecy found in the archives of Candlekeep, referenced by [[Jaheira]]:\n\n> *When the blood of the father flows through murder's chosen,*\n> *When the dead walk at the command of death's anointed,*\n> *When the tyrant's fist closes on the throne of lies,*\n> *Then shall the Three rise united, and the Gate shall fall.*\n\nThe prophecy appears to describe the current crisis: [[Orin the Red]] (Bhaal), [[Ketheric Thorm]] (Myrkul), and the unknown Chosen of Bane working together to bring down [[Baldur's Gate]]. [[The Harpers]] have been studying this text extensively.",
      relatedCharacterIds: [id.orin, id.ketheric, id.jaheira], relatedLocationIds: [id.baldursGate],
      relatedFactionIds: [id.harpers, id.cultAbsolute], relatedItemIds: [],
      tags: [id.tagMainQuest, id.tagSecret], isPublic: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.githyankiCreche, campaignId: id.campaign, title: 'The Githyanki Crèche',
      category: 'culture', era: '',
      description: "The githyanki are an extraplanar warrior race who dwell in the Astral Plane and serve their undying lich-queen, Vlaakith. They have a deep, ancestral hatred of mind flayers, who once enslaved their entire race.\n\n[[Crèche Y'llek]] is a hidden githyanki outpost in the mountains, disguised within the ruins of Rosymorn Monastery. The crèche contains a **zaith'isk** — a psionic device that can attempt to remove mind flayer tadpoles, though the process is extremely dangerous and may kill the patient.\n\nQueen Vlaakith has ordered all infected individuals brought to the crèche — not for healing, but for study and execution.",
      relatedCharacterIds: [], relatedLocationIds: [id.creche],
      relatedFactionIds: [], relatedItemIds: [],
      tags: [id.tagSideQuest], isPublic: true, createdAt: weekAgo, updatedAt: ts
    }
  ]

  // === NOTES ===
  const notes: Note[] = [
    {
      id: id.noteArcOutline, campaignId: id.campaign, title: 'Campaign Arc Outline',
      content: "## Main Arc: The Absolute Conspiracy\n\nThe party must uncover and dismantle the [[Cult of the Absolute]] before [[Baldur's Gate]] falls.\n\n### Act 1: Escape & Discovery\n- [x] Escape the Nautiloid\n- [x] Arrive at [[Emerald Grove]], meet refugees\n- [x] Rescue [[Volo]] from goblins\n- [ ] Investigate [[Grymforge]] for Sharran connection\n- [ ] Visit [[Crèche Y'llek]] for tadpole removal attempt\n\n### Act 2: The Shadow Curse\n- [ ] Travel through the [[Shadow-Cursed Lands]]\n- [ ] Assault [[Moonrise Towers]]\n- [ ] Defeat [[Ketheric Thorm]], free [[Duke Ravengard]]\n- [ ] Learn the truth about [[The Absolute & the Elder Brain]]\n\n### Act 3: Baldur's Gate\n- [ ] Confront [[Orin the Red]] in the Temple of Bhaal\n- [ ] Help [[Astarion]] deal with [[Cazador Szarr]]\n- [ ] Final assault on the Elder Brain\n\n### Side Quests\n- [ ] [[Astarion]]'s confrontation with [[Cazador Szarr]] at [[Cazador's Palace]]\n- [ ] [[Shadowheart]]'s Sharran memories in [[Grymforge]]\n- [ ] [[Gale]]'s orb and Mystra's demand\n- [ ] [[The Zhentarim]] smuggling operation",
      tags: [id.tagMainQuest], relatedCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale],
      relatedLoreIds: [id.absoluteElderBrain], relatedLocationIds: [id.baldursGate],
      relatedFactionIds: [id.cultAbsolute], relatedItemIds: [], relatedSessionIds: [id.session1, id.session2],
      isPublic: false, isPinned: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.noteCazadorWeakness, campaignId: id.campaign, title: "Cazador's Weakness",
      content: "## Intel on [[Cazador Szarr]]\n\nGathered from [[Astarion]]'s memories and Harper intelligence:\n\n- **Sunlight**: Standard vampire vulnerability, but his palace is underground\n- **Running water**: The palace has no natural water sources (deliberate)\n- **The Rite**: He *needs* [[Astarion]] alive for the ritual — won't kill him outright\n- **Spawn rebellion**: If the other spawn can be freed from domination, they'll turn on Cazador\n- **Radiant damage**: His necrotic shield doesn't protect against radiant (important for [[Tav]] and [[Shadowheart]])\n\n> Key strategy: free the spawn first, then corner him in the ritual chamber where he can't flee.",
      tags: [id.tagSecret], relatedCharacterIds: [id.cazador, id.astarion, id.tav, id.shadowheart],
      relatedLoreIds: [], relatedLocationIds: [id.cazadorPalace],
      relatedFactionIds: [], relatedItemIds: [], relatedSessionIds: [],
      isPublic: false, isPinned: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.noteNpcRelationships, campaignId: id.campaign, title: 'NPC Relationship Chart',
      content: "## Key NPC Relationships\n\n**[[Jaheira]]**\n- Allied with party, cautious trust\n- Has history with Duke Ravengard (mutual respect)\n- Suspects [[The Dead Three]] connection\n\n**[[Duke Ravengard]]**\n- [[Tav]]'s former commander — loyal bond\n- Captured at [[Moonrise Towers]], under Absolute's control\n\n**[[Volo]]**\n- Grateful to party for rescue\n- Accidentally gave [[Tav]] a magical prosthetic eye\n- Unreliable but well-meaning\n\n**[[Withers]]**\n- Mysterious, ancient, knows more than he says\n- Offers resurrection services at camp\n- True identity: Jergal (DM secret!)\n\n**[[Cazador Szarr]]** ↔ **[[Astarion]]**\n- Master/spawn relationship (200 years of abuse)\n- Cazador needs Astarion for the ritual\n- Astarion fears and hates him in equal measure",
      tags: [], relatedCharacterIds: [id.jaheira, id.ravengard, id.volo, id.withers, id.cazador, id.astarion, id.tav],
      relatedLoreIds: [], relatedLocationIds: [],
      relatedFactionIds: [], relatedItemIds: [], relatedSessionIds: [],
      isPublic: false, isPinned: false, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.noteBackstoryHooks, campaignId: id.campaign, title: 'Player Backstory Hooks',
      content: "## Backstory Threads to Weave In\n\n**[[Tav]]** — Oath of Devotion\n- Served under [[Duke Ravengard]] → personal stake in Moonrise rescue\n- Tyr's influence growing stronger as tadpole evolves\n- Will Tyr's power conflict with the tadpole?\n\n**[[Shadowheart]]** — Lost Memories\n- Shar wiped her memories of parents\n- Parents imprisoned in Shadowfell (leverage)\n- [[Grymforge]] may trigger memory fragments\n- [[Amulet of Selûne]] conflict with Sharran faith\n\n**[[Astarion]]** — 200 Years a Spawn\n- [[Cazador Szarr]] needs him for Rite of Profane Ascension\n- Scars on back = infernal contract text\n- Can he resist the temptation to complete the rite himself?\n\n**[[Gale]]** — The Orb\n- Netherese destruction orb in chest\n- Mystra wants him to self-destruct at the Elder Brain\n- Needs to consume [[The Necromancy of Thay]] or find alternative",
      tags: [], relatedCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale],
      relatedLoreIds: [], relatedLocationIds: [],
      relatedFactionIds: [], relatedItemIds: [id.necromancyOfThay, id.amuletOfSelune], relatedSessionIds: [],
      isPublic: false, isPinned: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.noteTadpolePowers, campaignId: id.campaign, title: 'Tadpole Powers Tracking',
      content: "## Illithid Powers Unlocked\n\nEach use of tadpole powers risks ceremorphosis. Track usage per character:\n\n### [[Tav]]\n- **Favourable Beginnings**: +1d4 to first attack/check per combat *(used 3 times)*\n- **Transfuse Health**: Transfer 1d6 HP to ally *(used 1 time)*\n\n### [[Shadowheart]]\n- **Survival Instinct**: Heal ally when they drop to 0 *(used 2 times)*\n\n### [[Astarion]]\n- **Vampiric Bite Enhancement**: Tadpole makes bite heal more *(used 4 times — concerning)*\n\n### [[Gale]]\n- **Psionic Overload**: Extra psychic damage on spell hits *(used 2 times)*\n- **Charm**: Illithid persuasion attempt *(used 1 time)*\n\n> **Warning:** At 10+ total uses per character, begin Wisdom saves DC 12 (+1 per use over 10) or gain a mind flayer physical trait.",
      tags: [id.tagMainQuest], relatedCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale],
      relatedLoreIds: [id.absoluteElderBrain], relatedLocationIds: [],
      relatedFactionIds: [], relatedItemIds: [], relatedSessionIds: [],
      isPublic: false, isPinned: false, createdAt: weekAgo, updatedAt: ts
    }
  ]

  // === DOCUMENTS ===
  const documents: Document[] = [
    {
      id: id.docJaheiraLetter, campaignId: id.campaign, title: 'Letter from Jaheira to the Harpers',
      type: 'letter',
      content: "*Sealed with the Harper pin — a silver harp between crescent moon horns.*\n\n---\n\nTo my fellow Harpers,\n\nThe situation at [[Moonrise Towers]] is worse than we feared. [[Ketheric Thorm]] commands a growing army of shadow-cursed undead, and the [[Shadow-Cursed Lands]] expand with each passing day. Our scouts cannot penetrate the darkness without magical protection.\n\nI have made contact with a group of adventurers — infected with the tadpole but still in control of their faculties. They may be our best hope. [[Tav]], their leader, has a soldier's discipline. [[Shadowheart]] carries a Selûnite artifact she doesn't fully understand. The others have their own complications.\n\nI am relocating to [[Emerald Grove]] to coordinate. Send reinforcements if you can spare them.\n\nFor the song,\n**[[Jaheira]]**\n\n*P.S. — I have a bad feeling about this. The Dead Three were involved the last time things went this wrong. — J.*",
      authorId: id.jaheira, recipientId: '', locationFoundId: id.emeraldGrove,
      tags: [id.tagMainQuest, id.tagHandout],
      relatedCharacterIds: [id.jaheira, id.ketheric, id.tav, id.shadowheart],
      relatedLoreIds: [id.shadowCurse], relatedLocationIds: [id.moonrise, id.emeraldGrove],
      relatedFactionIds: [id.harpers], relatedItemIds: [id.amuletOfSelune], relatedSessionIds: [],
      isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.docThayScroll, campaignId: id.campaign, title: 'The Prophecy Scroll',
      type: 'scroll',
      content: "*An ancient scroll, the parchment yellowed and brittle. The text glows faintly silver when read aloud.*\n\n---\n\n> When the blood of the father flows through murder's chosen,\n> When the dead walk at the command of death's anointed,\n> When the tyrant's fist closes on the throne of lies,\n> Then shall the Three rise united, and the Gate shall fall.\n>\n> But hope endures in the space between stars —\n> Four who carry the seed of the devourer\n> Shall stand where gods fear to tread,\n> And choose the fate of all.\n\n---\n\n*Found in the archives of [[Crèche Y'llek|the Rosymorn Monastery]] by [[Tav]]. The prophecy references [[The Dead Three]] and appears to describe the current crisis. [[Jaheira]] believes the \"four who carry the seed\" are the party members infected with tadpoles.*",
      authorId: '', recipientId: '', locationFoundId: id.creche,
      tags: [id.tagMainQuest, id.tagHandout],
      relatedCharacterIds: [id.tav, id.jaheira],
      relatedLoreIds: [id.bhaalProphecy, id.deadThree], relatedLocationIds: [id.creche],
      relatedFactionIds: [], relatedItemIds: [], relatedSessionIds: [],
      isPublic: true, createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.docOrinJournal, campaignId: id.campaign, title: "Orin's Encoded Journal",
      type: 'journal',
      content: "*A leather-bound journal written in a cipher of Bhaal. Decoded by [[Gale]] after 3 hours of work.*\n\n---\n\n**Entry 47:**\nFather speaks to me in dreams of blood. He says the [[Cazador Szarr|old vampire]] grows impatient. Good. Let him. [[Ketheric Thorm|The dead man]] holds [[Moonrise Towers]] well enough, but he lacks *artistry*.\n\n**Entry 52:**\nI have replaced the merchant in the Lower City. Nobody suspects. The face fits like a glove of skin. Father laughs.\n\n**Entry 58:**\nThe adventurers with the tadpoles grow stronger. The one called [[Tav]] — there is something *different* about that one. The Absolute watches them closely. Perhaps Father would like me to *introduce* myself.\n\n**Entry 61:**\nI will take someone they love. They will come to me in the temple beneath [[Baldur's Gate]]. And then Father will have his offering.\n\n---\n\n*DM: The \"replaced merchant\" is the potion seller in the Lower City market. Orin will reveal this when confronting the party.*",
      authorId: id.orin, recipientId: '', locationFoundId: id.baldursGate,
      tags: [id.tagSecret],
      relatedCharacterIds: [id.orin, id.cazador, id.ketheric, id.tav],
      relatedLoreIds: [id.deadThree], relatedLocationIds: [id.baldursGate, id.moonrise],
      relatedFactionIds: [id.cultAbsolute], relatedItemIds: [], relatedSessionIds: [],
      isPublic: false, createdAt: weekAgo, updatedAt: ts
    }
  ]

  // === SESSIONS ===
  const s1Sections: PlanningSection[] = [
    {
      id: id.s1ps1, title: 'Session Goals', order: 0,
      content: "- Introduce all four PCs and establish the tadpole threat\n- Set up [[Emerald Grove]] as a base of operations\n- First combat encounter to test party dynamics\n- Plant hooks for [[The Harpers]], [[Cult of the Absolute]], and [[The Zhentarim]]"
    },
    {
      id: id.s1ps2, title: 'Key NPCs', order: 1,
      content: "- **[[Volo]]** — comic relief, rescued from goblins, offers (bad) tadpole surgery\n- **[[Jaheira]]** — serious, commanding, gives the [[Letter from Jaheira to the Harpers|Harper letter]]\n- **[[Withers]]** — appears at camp after first long rest, offers resurrection services"
    },
    {
      id: id.s1ps3, title: 'Plot Hooks', order: 2,
      content: "- [[Letter from Jaheira to the Harpers]] — establishes Moonrise threat\n- [[The Prophecy Scroll]] — found in monastery ruins en route\n- Goblin prisoner mentions serving \"the Absolute\" — first hint of [[Cult of the Absolute]]\n- Zhentarim agent offers gold for a \"package\" delivery to [[Baldur's Gate]] ([[The Zhentarim]] hook)"
    },
    {
      id: id.s1ps4, title: 'Prepared Encounters', order: 3,
      content: "### Goblin Ambush (Medium, 4 PCs level 5)\n- 6 goblins (CR 1/4 each)\n- 1 goblin boss (CR 1) — **Drek** leads the ambush\n- Terrain: forest road, fallen logs for half cover\n- Goblins flee at 50% casualties\n\n### Treasure\n- 45 gp, 120 sp from goblin pouches\n- [[Sword of Justice]] found on fallen paladin nearby\n- Crude map showing [[Moonrise Towers]] location"
    }
  ]

  const s2Sections: PlanningSection[] = [
    {
      id: id.s2ps1, title: 'Session Goals', order: 0,
      content: "- Travel through the [[Shadow-Cursed Lands]] — establish the danger and atmosphere\n- Reach [[Moonrise Towers]] and gather intelligence\n- [[Shadowheart]]'s [[Amulet of Selûne]] reacts to the shadow curse — character moment\n- Set up the assault on Moonrise for session 3"
    },
    {
      id: id.s2ps2, title: 'Key NPCs', order: 1,
      content: "- **[[Ketheric Thorm]]** — may appear on the towers battlements, taunting\n- **[[Duke Ravengard]]** — glimpsed through a window, clearly under tadpole control\n- **Harper scouts** — 2-3 NPCs who can provide intel and die dramatically to show stakes"
    },
    {
      id: id.s2ps3, title: 'Plot Hooks', order: 2,
      content: "- The [[Amulet of Selûne]] begins glowing intensely near the towers — points toward the Shadowfell prison below\n- A shadowy figure (Nightsong) calls out telepathically to [[Shadowheart]]\n- [[Jaheira]] reveals her theory about [[The Dead Three]] connection\n- Captured cultists mention an \"Elder Brain\" beneath the towers"
    },
    {
      id: id.s2ps4, title: 'Prepared Encounters', order: 3,
      content: "### Shadow Curse Gauntlet (Travel)\n- DC 13 Constitution saves every 10 minutes without moonlight protection\n- Failure: 2d6 necrotic damage\n- [[Amulet of Selûne]] provides 30ft radius protection bubble\n\n### Moonrise Scouts (Hard, 4 PCs level 5)\n- 4 shadow-cursed undead (use Wight stat block)\n- 1 necromancer cultist (CR 3)\n- Terrain: ruined village, darkness, difficult terrain"
    }
  ]

  const s1Combatants: Combatant[] = [
    {
      id: id.comb1, name: 'Tav', characterId: id.tav,
      initiative: 18, hp: 38, maxHp: 45, armorClass: 18,
      conditions: [], conditionDurations: {}, concentration: '', isActive: true,
      attackMod: 7, damageDice: '1d8+5', saveMod: 3
    },
    {
      id: id.comb2, name: 'Astarion', characterId: id.astarion,
      initiative: 20, hp: 25, maxHp: 33, armorClass: 15,
      conditions: [], conditionDurations: {}, concentration: '', isActive: true,
      attackMod: 7, damageDice: '1d8+4', saveMod: 1
    },
    {
      id: id.comb3, name: 'Gale', characterId: id.gale,
      initiative: 15, hp: 22, maxHp: 28, armorClass: 13,
      conditions: [], conditionDurations: {}, concentration: 'Haste', isActive: true,
      attackMod: 7, damageDice: '3d10', saveMod: 5
    },
    {
      id: id.comb4, name: 'Shadowheart', characterId: id.shadowheart,
      initiative: 8, hp: 38, maxHp: 38, armorClass: 16,
      conditions: [], conditionDurations: {}, concentration: 'Spirit Guardians', isActive: true,
      attackMod: 5, damageDice: '1d6+3', saveMod: 5
    },
    {
      id: id.comb5, name: 'Drek (Goblin Boss)', characterId: '',
      initiative: 12, hp: 0, maxHp: 21, armorClass: 17,
      conditions: ['unconscious'], conditionDurations: {}, concentration: '', isActive: false,
      attackMod: 4, damageDice: '1d6+2', saveMod: 0
    }
  ]

  const sessions: Session[] = [
    {
      id: id.session1, campaignId: id.campaign,
      title: 'Escape from the Nautiloid', sessionNumber: 1,
      status: 'completed', scheduledDate: weekAgo,
      planningSections: s1Sections,
      referencedCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale, id.volo, id.jaheira, id.withers],
      referencedLocationIds: [id.emeraldGrove, id.elfsong],
      referencedFactionIds: [id.harpers, id.zhentarim],
      referencedItemIds: [id.swordOfJustice],
      combatants: s1Combatants,
      currentTurnIndex: 0, roundNumber: 5,
      scratchPad: "Party took a short rest after the goblin fight. [[Tav]] used 2 hit dice. [[Astarion]] fed on a goblin corpse (the party doesn't know yet). [[Gale]] picked up the [[The Necromancy of Thay]] but hasn't opened it.\n\n**XP awarded:** 450 each\n**Level up:** No (need 2,700 more for level 6)\n\n**Player quotes to remember:**\n- \"I would like to bite the goblin. For... science.\" — Astarion's player\n- \"Tyr would want me to loot the body. It's what paladins do.\" — Tav's player",
      linkedNoteIds: [id.noteArcOutline],
      createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.session2, campaignId: id.campaign,
      title: 'Shadows Over the Grove', sessionNumber: 2,
      status: 'planning', scheduledDate: weekFromNow,
      planningSections: s2Sections,
      referencedCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale, id.ketheric, id.ravengard, id.jaheira],
      referencedLocationIds: [id.shadowCursedLands, id.moonrise],
      referencedFactionIds: [id.cultAbsolute, id.harpers],
      referencedItemIds: [id.amuletOfSelune],
      combatants: [],
      currentTurnIndex: 0, roundNumber: 0,
      scratchPad: '',
      linkedNoteIds: [id.noteArcOutline, id.noteTadpolePowers],
      createdAt: ts, updatedAt: ts
    }
  ]

  // === SCENES ===
  const scenes: Scene[] = [
    {
      id: id.s1scene1, campaignId: id.campaign, sessionId: id.session1,
      title: 'Crash of the Nautiloid', order: 0,
      description: "The session opens mid-action: the mind flayer Nautiloid is under attack by githyanki dragon riders. The party — [[Tav]], [[Shadowheart]], [[Astarion]], and [[Gale]] — must escape the crashing ship while fighting off mind flayers and imps.\n\nThe ship crashes near [[Emerald Grove]], scattering the party across the beach. They regroup and realize they each carry a mind flayer tadpole behind their eye.",
      locationId: id.emeraldGrove, presentCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale],
      status: 'completed',
      dmNotes: "Used theater of the mind for the Nautiloid — no battle map needed. Players loved the cinematic opening. Astarion's player immediately tried to bite a downed mind flayer (told them it tasted awful).",
      createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.s1scene2, campaignId: id.campaign, sessionId: id.session1,
      title: 'Welcome to the Grove', order: 1,
      description: "The party arrives at [[Emerald Grove]] and finds it under siege from goblin raiders. Inside, tiefling refugees shelter alongside suspicious druids. [[Jaheira]] approaches the party, recognizing the signs of tadpole infection, and offers [[The Harpers]]' assistance in exchange for help against the goblins.\n\n[[Volo]] is found tied up in the goblin camp perimeter — he was \"researching\" goblins for his next book.",
      locationId: id.emeraldGrove, presentCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale, id.jaheira, id.volo],
      status: 'completed',
      dmNotes: "Good RP scene. Shadowheart's player was suspicious of Jaheira (in character — Shar vs Harpers tension). Astarion tried to pickpocket a druid and rolled a nat 1. Volo offered to remove the tadpoles — party wisely declined for now.",
      createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.s1scene3, campaignId: id.campaign, sessionId: id.session1,
      title: 'Goblin Ambush on the Road', order: 2,
      description: "While scouting the road toward [[Moonrise Towers]], the party is ambushed by a goblin raiding party led by a goblin boss named Drek. The goblins attack from the treeline using hit-and-run tactics.\n\nAfter defeating them, the party finds a crude map pointing to [[Moonrise Towers]] and a letter mentioning \"the Absolute's will.\" This is the party's first direct evidence of the [[Cult of the Absolute]]'s influence in the region.",
      locationId: id.emeraldGrove, presentCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale],
      status: 'completed',
      dmNotes: "Combat took about 45 minutes. Astarion crit on the goblin boss with Sneak Attack — 32 damage in one hit. Gale used Haste on Tav (great combo with Extra Attack). Shadowheart's Spirit Guardians carried the fight. Party found the [[Sword of Justice]] on a dead paladin nearby.",
      createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.s2scene1, campaignId: id.campaign, sessionId: id.session2,
      title: 'Into the Shadow-Cursed Lands', order: 0,
      description: "The party enters the [[Shadow-Cursed Lands]] with [[Jaheira]] as their guide. The darkness is oppressive — non-magical light sources gutter and die. [[Shadowheart]]'s [[Amulet of Selûne]] begins to glow, creating a protective bubble of moonlight around the party.\n\nAs they travel, they pass through a ruined village where shadow-cursed undead lurk. The remains of Harper scouts litter the road — a grim warning of what awaits at [[Moonrise Towers]].",
      locationId: id.shadowCursedLands, presentCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale, id.jaheira],
      status: 'planned',
      dmNotes: "Use ambient music: Darkest Dungeon OST. Describe the oppressive atmosphere — silence except for distant moaning, black water, dead trees. Astarion should note that even his vampire darkvision struggles here. Shadowheart's amulet glowing should be a dramatic moment.",
      createdAt: ts, updatedAt: ts
    },
    {
      id: id.s2scene2, campaignId: id.campaign, sessionId: id.session2,
      title: 'Moonrise in Sight', order: 1,
      description: "The party crests a hill and sees [[Moonrise Towers]] for the first time — a dark fortress surrounded by an army of undead. [[Ketheric Thorm]] stands on the battlements, visible even from a distance, radiating necrotic energy.\n\nThrough a high window, [[Tav]] catches a glimpse of [[Duke Ravengard]] — alive but clearly under the Absolute's control. The party must decide: assault the towers directly, or seek allies and intelligence first.",
      locationId: id.moonrise, presentCharacterIds: [id.tav, id.shadowheart, id.astarion, id.gale, id.jaheira],
      status: 'planned',
      dmNotes: "End the session on this cliffhanger. Let the party debate their approach — frontal assault vs infiltration vs seeking more allies. Jaheira will counsel caution. If they try to rush in, have Ketheric demonstrate his power by casually destroying a shadow-cursed creature from the battlements.",
      createdAt: ts, updatedAt: ts
    }
  ]

  // === GAME RULES ===
  const gameRules: GameRule[] = [
    {
      id: id.grTadpole, campaignId: id.campaign,
      title: 'Tadpole Powers (House Rule)',
      description: "Each PC has access to illithid powers granted by their mind flayer tadpole. Using these powers is tempting but dangerous:\n\n- **Unlocking powers**: Each character can unlock 1 new power per long rest by \"embracing\" the tadpole\n- **Usage tracking**: Track total uses per character in the Tadpole Powers note\n- **Consequences**: At 10+ total uses, the character must make a DC 12 Wisdom save (+1 per use over 10) after each long rest. Failure means gaining a mind flayer physical trait (tentacle-like fingers, grey skin patches, etc.)\n- **No take-backs**: Once a power is unlocked, it can't be un-learned\n- **NPC reactions**: Heavy tadpole users may be recognized by githyanki, mind flayers, or Absolute cultists",
      createdAt: weekAgo, updatedAt: ts
    },
    {
      id: id.grInspiration, campaignId: id.campaign,
      title: 'Inspiration System',
      description: "Players earn inspiration for:\n- Creative roleplay moments that drive the story forward\n- Clever problem-solving that surprises the DM\n- Playing into character flaws or bonds in a way that creates interesting complications\n- Making the table laugh (rule of cool)\n\nInspiration can be spent to:\n- Gain advantage on any d20 roll\n- Re-roll a failed death saving throw\n- Add +2 to an ally's roll (collaborative heroism)\n\nMax 1 inspiration per player at a time. Inspiration expires at the end of the session if unused.",
      createdAt: weekAgo, updatedAt: ts
    }
  ]

  return {
    campaigns,
    characters,
    locations,
    factions,
    items,
    lore,
    notes,
    documents,
    sessions,
    scenes,
    tags,
    gameRules
  }
}
