//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import * as A1lib from "alt1";
import ChatboxReader from "alt1/chatbox";

import "./index.html";
import "./appconfig.json";
import "./css/nis.css";
import "./css/style.css";
import "./css/tooltipster.bundle.min.css";
import "./css/tooltipster.css";
import "./images/Zamorak_chathead.png";

if (window.alt1) {
	alt1.identifyAppUrl("./appconfig.json");
} else {
	let addappurl = `alt1://addapp/${new URL("./appconfig.json", document.location.href).href}`;
	document.querySelector("body").innerHTML = `Alt1 not detected, click <a href='${addappurl}'>here</a> to add this app to Alt1`;
}

const appColor = A1lib.mixColor(255, 0, 0);
const reader = new ChatboxReader();

reader.readargs = {
	colors: [
		A1lib.mixColor(153, 255, 153), // Green (Zamorak's voice)
		A1lib.mixColor(232, 4, 4), // Red (Zamorak)
	],
};

var phase = A1lib.webpackImages({
	p1: require("./images/edicts_1.data.png"),
	p2: require("./images/edicts_2.data.png"),
	p3: require("./images/edicts_3.data.png"),
	p4: require("./images/edicts_4.data.png"),
	p5: require("./images/edicts_5.data.png"),
	p6: require("./images/edicts_6.data.png"),
});

// Spec order:
// https://cdn.discordapp.com/attachments/992218608602189854/996933729933082784/K1u9v5j.png
const entry = {
	en: "But this is as far as you go",
	fr: "pas plus loin",
	de: "Sie haben es geschafft",
};

const channeler = "Zamorak begins to draw power and energy";
const flames_of_zamorak = {
	name: "Flames of Zamorak",
	en: "world will burn",
	fr: "Que ce monde",
	de: "Diese Welt wird",
	tooltip: `   
- Zamorak will yell "The world will burn." and slam into the ground, 
  dealing 2 melee hits and spawning Flames of Zamorak between 
  the player with aggression and Zamorak
- To deal with this, all players walk under boss, :DeflectMelee: 
  and use defensives if low hp
- Black smoke (Flames of Zamorak) goes towards the a random player, 
  the more smoke that is absorbed by a player the higher the typeless hit on them will be.
  If not picked up Zamorak gets a damage reduction applied to him
`,
};
const infernal_tomb = {
	name: "Infernal Tomb",
	en: "into the dark",
	fr: "Avancez dans les",
	de: "Kommen Sie ins",
	tooltip: `
- Zamorak says "Step into the dark... meet your death.", 
  targets players, assigns a rune to them overhead and 
  transports them to Infernus where greater demons are marching 
  towards a portal to the main arena
- Most players elect to use a quick couple abilities to kill 
  the demons (ideally :caroming4: :gchain: → ability)
- Players must go to the pad with the same 
  corresponding rune they received overhead
	- At higher enrages, it is highly suggested to pre-stun 
	  Zamorak and defeat all demons before exiting
`,
};
const adrenaline_cage = {
	name: "Adrenaline Cage",
	en: "chaos, unfettered",
	fr: "LE CHAOS",
	de: "TOTALES CHAOS",
	tooltip: `
- Zamorak will say "Chaos, unfettered!" then drop 
  the prayers of those affected by the attack, 
  preparing to bombard base with heavy magic attacks.
- Remain still, :DeflectMage: and use :debil: , :reflect: or :devo:
`,
};
const chaos_blast = {
	name: "Chaos Blast",
	en: "will tear you",
	fr: "vais vous mettre",
	de: "Ich werde Sie",
	tooltip: `
- Zamorak will charge up his attack shouting "I will tear you asunder!"
- To deal with the mechanic successfully stun him enough times, 
  after such a damage requirement will appear to force him 
  to launch the attack early
- He will yell Feel the rage of a god. and send a red projectile 
  that deals up to 25,000 soft typeless damage - this is 
  reduced based on how fast he is interrupted
- Use :vitality: / :res: / :disrupt: , at higher enrages you may need to use :immort:
`,
};
const rune_dest = {
	name: "Rune of Destruction",
	en: "already dead",
	fr: "votre mort est",
	de: "Sie sind schon",
	tooltip: `
- Zamorak will yell "You're already dead." and lay a massive 
  red rune around him, with a gap between two circles
- Black sludge will run clockwise or counterclockwise 
  sometimes changing direction and applies stuns to those caught in it
- Standing in the red areas will deal rapid soft typeless damage
- The player cannot teleport to Infernus and runes cannot 
  be charged for the duration of the attack
`,
};

var special_attacks = {
	p1: [flames_of_zamorak, infernal_tomb, rune_dest],
	p2: [infernal_tomb, adrenaline_cage, flames_of_zamorak],
	p3: [adrenaline_cage, chaos_blast, infernal_tomb],
	p4: [chaos_blast, rune_dest, adrenaline_cage],
	p5: [rune_dest, flames_of_zamorak, chaos_blast],
	p6: [flames_of_zamorak, infernal_tomb, rune_dest],
};

function showSelectedChat(chat) {
	//Attempt to show a temporary rectangle around the chatbox.  skip if overlay is not enabled.
	try {
		alt1.overLayRect(appColor, chat.mainbox.rect.x, chat.mainbox.rect.y, chat.mainbox.rect.width, chat.mainbox.rect.height, 2000, 5);
	} catch {}
}

window.setTimeout(function () {
	//Find all visible chatboxes on screen
	let findChat = setInterval(function () {
		if (reader.pos === null) reader.find();
		else {
			console.log(reader);
			clearInterval(findChat);
			//If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
			reader.pos.mainbox = reader.pos.boxes[0];

			showSelectedChat(reader.pos);
			updateUI(1);
			console.log(reader.pos);
			setInterval(function () {
				readChatbox();
			}, 600);
		}
	}, 1000);
}, 50);

function readChatbox() {
	var opts = reader.read() || [];
	var chat = "";

	for (const a in opts) {
		chat += opts[a].text + " ";
	}
	console.log(chat);

	specAttackTracker(opts);
}

function compare(str1: string, str2: { en: string; fr: string; de: string }) {
	// Compare all languages with the input string
	return (
		str1.toLowerCase().includes(str2.en.toLowerCase()) ||
		str1.toLowerCase().includes(str2.fr.toLowerCase()) ||
		str1.toLowerCase().includes(str2.de.toLowerCase())
	);
}

function getPhase() {
	var current_phase = 1;

	var img = A1lib.captureHoldFullRs();

	// Look for the current phase
	for (let key in phase) {
		var img_found = img.findSubimage(phase[key]).length > 0;
		if (img_found) {
			break;
		}
		current_phase++;
	}

	// No phase found
	if (current_phase > 6) {
		current_phase = -1;
	}

	return current_phase;
}

// Function to calculate next special attack if phasing immediately
function getNextSpecImmediate(currentPhase, nextSpec) {
	// Get the next phase
	let nextPhase = currentPhase + 1;
	if (nextPhase > 6) nextPhase = 1; // Loop back to phase 1 if needed
	
	// Following the red arrow in the chart
	// Always goes to 3rd spec unless it was the second spec skipped
	let nextSpecIndex = nextSpec == 1 ? 0 : 2;
	
	return special_attacks["p" + nextPhase][nextSpecIndex];
}

// Function to calculate next special attack if delaying phase
function getNextSpecDelayed(currentPhase, nextSpec) {
	// Get the next phase
	let nextPhase = currentPhase + 1;
	if (nextPhase > 6) nextPhase = 1; // Loop back to phase 1 if needed
	
	// Following the black arrow in the chart
	// After doing the current spec, go back and down
	let delayedSpecIndex = nextSpec - 1;
	if (delayedSpecIndex < 0) delayedSpecIndex = 2;
	
	return special_attacks["p" + nextPhase][delayedSpecIndex];
}

var last_phase = 1;
var next_spec = 0;
var skipped_spec = true;
function specAttackTracker(lines) {
	var new_phase = getPhase();
	var current_phase = new_phase == -1 ? last_phase : new_phase;

	if (current_phase != last_phase) {
		last_phase = current_phase;

		if (skipped_spec) {
			// Go back and follow red arrow in the chart
			// Always goes to 3rd spec unless it was the second spec skipped
			next_spec--;
			next_spec = next_spec == 1 ? 0 : 2;
			console.log("Skipped a spec");
		} else {
			// Go back and down following the black arrow in the chart
			next_spec--;
			if (next_spec < 0) next_spec = 2;
		}
		updateUI(current_phase);
		skipped_spec = true;
	}

	for (const a in lines) {
		var line = lines[a].text;
		var specs = special_attacks["p" + current_phase]; // Get the current phase's special attacks
		for (let idx = 0; idx < specs.length; idx++) {
			if (compare(line, entry)) {
				console.log("New kill");
				skipped_spec = true;
				current_phase = 1;
				updateUI(current_phase);
				next_spec = 0;
			}
			if (compare(line, specs[idx])) {
				next_spec = idx + 1;
				skipped_spec = false;

				if (next_spec > 2) next_spec = 0;

				console.log("Next spec: " + next_spec + " Phase: " + current_phase);
				updatePhaseTransitionInfo(current_phase, next_spec);
				break;
			}
		}
	}

	document.querySelectorAll("#spec tr").forEach(el => el.classList.remove("selected"));
	document.querySelectorAll("#spec tr")[next_spec].classList.add("selected");

	// Update the phase transition info whenever we update the selected spec
	updatePhaseTransitionInfo(current_phase, next_spec);
}

// New function to update the phase transition information
function updatePhaseTransitionInfo(currentPhase, nextSpec) {
	const nextSpecImmediate = getNextSpecImmediate(currentPhase, nextSpec);
	const nextSpecDelayed = getNextSpecDelayed(currentPhase, nextSpec);
	
	const immediateElement = document.querySelector("#next-spec-immediate") as HTMLElement;
	const delayedElement = document.querySelector("#next-spec-delayed") as HTMLElement;
	
	if (immediateElement && delayedElement) {
		immediateElement.innerText = nextSpecImmediate.name;
		immediateElement.setAttribute("title", nextSpecImmediate.tooltip);
		
		delayedElement.innerText = nextSpecDelayed.name;
		delayedElement.setAttribute("title", nextSpecDelayed.tooltip);
	}
}

function updateUI(current_phase) {
	const phase = document.querySelector("#phase") as HTMLElement;
	phase.innerText = "Phase " + current_phase;
	document.querySelectorAll("#spec tr > td").forEach(function (el: HTMLElement, index) {
		el.innerText = special_attacks["p" + current_phase][index].name;
		el.setAttribute("title", special_attacks["p" + current_phase][index].tooltip);
	});

	// Update the phase transition info when UI is updated
	updatePhaseTransitionInfo(current_phase, next_spec);
}