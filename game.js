//globals
var isOneToFour = false;

var cardTypes = ["crawl-flip", "heater-flip", "alarm-flip", "_000-flip", "plan-flip", "roll-flip"];
var cardTypesStr = cardTypes.join(" ");


var fiveToSixMatches = {
	"crawl-flip-text": "crawl-image",
	"drop-roll-text": "roll-image",
	"_2-metres-text": "metres-flip",
	"escape-text": "plan-image",
	"alarm-text": "alarm-image",
	"_000-text": "_000-image",
	"crawl-image": "crawl-flip-text",
	"roll-image": "drop-roll-text",
	"metres-flip": "_2-metres-text",
	"plan-image": "escape-text",
	"alarm-image": "alarm-text",
	"_000-image": "_000-text"
};

var gameState = {
	cards: [],
	activeCard1: -1,
	activeCard2: -1,
	activeCardIndex1: "",
	activeCardIndex2: "",
	gameComplete: false
};

var gameStateFiveToSix = {
	cards: [],
	activeCard1: -1,
	activeCard2: -1,
	activeCardIndex1: "",
	activeCardIndex2: "",
	gameComplete: false
};
var ix;

$(document).ready(function() {

	//change data-ix to prevent overlap with webflow js
	$("a[data-ix='cardflip']").attr("data-ix", "cardflop");

	//set the game mode when 1-4 click
	$(".button-1-4").click(function() {
		setGameMode(true);
	});

	//set game mode when 5-6 clicked
	$(".button-5-6").click(function() {
		setGameMode(false);
	});

	//listener for welldone button
	$(".well-done-button").click(function() {
		wellDoneClicked();
	});

	initAnimations();
	
});

function showComplete() {
	$("#well-done-wrapper").delay(800).slideDown(400, function() {
		$("html, body").animate({scrollTop: $("#well-done-wrapper").offset().top});
	});
	
}

function hideComplete() {
	$("#well-done-wrapper").slideUp();
}
function initAnimations() {
	ix = Webflow.require('ix');
	ix.destroy();
}

function setGameMode(isOneToFourGrade) {
	isOneToFour = isOneToFourGrade;

	//init 1-4 game
	if (isOneToFour) {
		//listeners for 1-4 card flips
		$("a._5-6-grade").click(function() {
			cardClicked($(this));
		});

		initOneToFour();
	} else {
		//listeners for 5-6 card flips
		$("a._5-6-grade-new").click(function() {
			cardClickedFiveToSix($(this));
		});
		initFiveToSix();
	}
	//init drag game
	hideComplete();
}

function wellDoneClicked() {
	//reset droppable cards in case they have moved
	$(".correct-image").css("display", "none");
}

function initOneToFour() {

	//reset game state
	gameState = {
		cards: [],
		activeCard1: -1,
		activeCard2: -1,
		activeCardIndex1: "",
		activeCardIndex2: "",
		gameComplete: false
	}


	//shuffle cards
	shuffleCards();

	
	//ensure all 5-6 game cards are display none and relevant ones visible
	$("a._5-6-grade-new").css("display", "none");
	$("a._5-6-grade").css("display", "flex");
	//ensure all flipped down
	$("div.card-wrapper ._5-6-flip").each(function(index) {
		triggerCardFlipDown(index);
	});



	//hide ticks
}

function initFiveToSix() {
	

	//reset game state
	gameStateFiveToSix = {
		cards: [],
		activeCard1: -1,
		activeCard2: -1,
		activeCardIndex1: "",
		activeCardIndex2: "",
		gameComplete: false
	}

	//shuffle drag cards
	shuffleFiveToSixCards();

	//ensure all 1-4 cards are hidden and relevant ones visible
	$("a._5-6-grade").css("display", "none");
	$("a._5-6-grade-new").css("display", "flex");

	//ensure all flipped down
	$("div.card-wrapper ._5-6-flip").each(function(index) {
		triggerCardFlipDown(index);
	});
	
}

function shuffleFiveToSixCards() {


	var cardNames = [];

	$("a._5-6-grade-new div._5-6-flip").each(function(index) {
		$(this).attr("game-data-index", index);
		var cardName = getCardNameFiveToSix($(this));
		cardNames.push(cardName);
	});


	shuffleArray(cardNames);

	$("a._5-6-grade-new div._5-6-flip").each(function(index) {
		$(this).attr("class", "_5-6-flip " + cardNames[index]);
		gameStateFiveToSix.cards.push({name: cardNames[index], matched: false, faceUp: false});
	});
}



function cardClickedFiveToSix(click) {
	if (isOneToFour) {
		return;
	}
	var index = getCardIndex($(click).children("._5-6-flip"));
	var cardName = getCardNameFiveToSix($(click).children("._5-6-flip"));
	/*
	console.log(index);
	console.log(cardName);
	*/

	if (!cardName) {
		throw "No such card 5-6";
		return;
	} else {
		console.log(cardName);
	}

	//if game is over, do nothing
	if (gameStateFiveToSix.gameComplete) {
		return;
	} 

	//if clicked card is already matched, do nothing
	if (gameStateFiveToSix.cards[index].matched) {
		return;
	}
	//if no cards active
	if (gameStateFiveToSix.activeCard1 === -1) {
		gameStateFiveToSix.activeCard1 = index;
		gameStateFiveToSix.cards[index].faceUp = true;
		//!!trigger cardflip with no tick
		triggerCardFlipUp(index);
	//if 1 card is already face up then check for a match
	} else if (gameStateFiveToSix.activeCard1 > -1 && gameStateFiveToSix.activeCard2 === -1) {
		//if card is already active
		if (gameStateFiveToSix.activeCard1 === index) {
			return;
		}

		gameStateFiveToSix.activeCard2 = index;
		//if match
		if (fiveToSixMatches[gameStateFiveToSix.cards[gameStateFiveToSix.activeCard1].name] === gameStateFiveToSix.cards[gameStateFiveToSix.activeCard2].name) {
			gameStateFiveToSix.cards[gameStateFiveToSix.activeCard1].matched = true;
			gameStateFiveToSix.cards[gameStateFiveToSix.activeCard2].matched = true;
			//!!trigger cardflip and ticks
			triggerCardFlipUp(gameStateFiveToSix.activeCard2);
			triggerTick(gameStateFiveToSix.activeCard1);
			triggerTick(gameStateFiveToSix.activeCard2);
			resetActiveCards();
			var complete = isGameCompleteFiveToSix();
			if (complete) {
				console.log("Game complete!");
				gameStateFiveToSix.gameComplete = true;
				//show compelete button
				showComplete();
			}
			
		//if not a match
		} else {
			gameStateFiveToSix.cards[gameStateFiveToSix.activeCard1].faceUp = false;
			gameStateFiveToSix.cards[gameStateFiveToSix.activeCard2].faceUp = false;

			//!!trigger flip up then flip back
			triggerCardFlipUp(gameStateFiveToSix.activeCard2);
			window.setTimeout(flipDownActiveCards, 1000, gameStateFiveToSix.activeCard1, gameStateFiveToSix.activeCard2);
			
			window.setTimeout(resetActiveCards, 1100);
		}
		
		
	//if two cards already face up
	} else if (gameStateFiveToSix.activeCard1 > -1 && gameStateFiveToSix.activeCard2 > -1) {
		return;
	}



}

function getCardNameFiveToSix(card) {
	if (!card) {
		return;
	}

	var classes = card.get(0).classList;
	for (let className of classes) {
		if (fiveToSixMatches.hasOwnProperty(className)) {
			return className;
		}
	}
	return;
}

function cardClicked(click) {

	//if not one to four game, return
	if (!isOneToFour) {
		return;
	}


	var index = getCardIndex($(click).children("._5-6-flip"));
	var cardName = getCardName(index);


	if (!cardName) {
		throw "No such card";
		return;
	} else {
		console.log(cardName);
	}

	//if game is over, do nothing
	if (gameState.gameComplete) {
		return;
	} 

	//if clicked card is already matched, do nothing
	if (gameState.cards[index].matched) {
		return;
	}
	//if no cards active
	if (gameState.activeCard1 === -1) {
		gameState.activeCard1 = index;
		gameState.cards[index].faceUp = true;
		//!!trigger cardflip with no tick
		triggerCardFlipUp(index);
	//if 1 card is already face up then check for a match
	} else if (gameState.activeCard1 > -1 && gameState.activeCard2 === -1) {
		//if card is already active
		if (gameState.activeCard1 === index) {
			return;
		}

		gameState.activeCard2 = index;
		//if match
		if (gameState.cards[gameState.activeCard1].name === gameState.cards[gameState.activeCard2].name) {
			gameState.cards[gameState.activeCard1].matched = true;
			gameState.cards[gameState.activeCard2].matched = true;
			//!!trigger cardflip and ticks
			triggerCardFlipUp(gameState.activeCard2);
			triggerTick(gameState.activeCard1);
			triggerTick(gameState.activeCard2);
			resetActiveCards();
			var complete = isGameComplete();
			if (complete) {
				console.log("Game complete!");
				gameState.gameComplete = true;
				//show compelete button
				showComplete();
			}
			
		//if not a match
		} else {
			gameState.cards[gameState.activeCard1].faceUp = false;
			gameState.cards[gameState.activeCard2].faceUp = false;

			//!!trigger flip up then flip back
			triggerCardFlipUp(gameState.activeCard2);
			window.setTimeout(flipDownActiveCards, 1000, gameState.activeCard1, gameState.activeCard2);
			
			window.setTimeout(resetActiveCards, 1100);
		}
		
		
	//if two cards already face up
	} else if (gameState.activeCard1 > -1 && gameState.activeCard2 > -1) {
		return;
	}
}

function isGameComplete() {
	for (let c of gameState.cards) {
		if (!c.matched) {
			return false;
		}
	}
	return true;
}

function isGameCompleteFiveToSix() {
	for (let c of gameStateFiveToSix.cards) {
		if (!c.matched) {
			return false;
		}
	}
	return true;
}
function resetActiveCards() {
	if (isOneToFour) {
		gameState.activeCard1 = -1;
		gameState.activeCard2 = -1;
	} else {
		gameStateFiveToSix.activeCard1 = -1;
		gameStateFiveToSix.activeCard2 = -1;
	}


}
function flipDownActiveCards(card1Index, card2Index) {
	triggerCardFlipDown(card1Index);
	triggerCardFlipDown(card2Index);
}
/* animations functions */
function triggerCardFlipUp(index) {
	var card = getCardForIndex(index);
	
	var trigger1 = {
              "type":"click",
              "selector":"._5-6-bg",
              "descend":true,
              "preserve3d":true,
              "stepsA":[ {
                  "transition": "transform 300ms linear 0", "rotateX": "0deg", "rotateY": "90deg", "rotateZ": "0deg"
              }
              ],
              "stepsB":[]
          };
    var trigger2 = {
              "type":"click",
              "selector":"._5-6-flip",
              "descend":true,
              "preserve3d":true,
              "stepsA":[ {
                  "wait": "300ms"
              }
              ,
              {
                  "opacity": 1
              }
              ,
              {
                  "transition": "transform 300ms linear 0", "rotateX": "0deg", "rotateY": "0deg", "rotateZ": "0deg"
              }
              ],
              "stepsB":[]
          };

	ix.run(trigger1, card);
	ix.run(trigger2, card);
	
         
          
}

function triggerCardFlipDown(index) {
	var card = getCardForIndex(index);
	var trigger1 = {
              "type":"click",
              "selector":"._5-6-bg",
              "descend":true,
              "preserve3d":true,
              "stepsA":[ {
              		"wait": "300ms"
              },
              	{
                  "transition": "transform 500ms linear 0", "rotateX": "0deg", "rotateY": "0deg", "rotateZ": "0deg"
              }
              ],
              "stepsB":[]
          };
    var trigger2 = {
              "type":"click",
              "selector":"._5-6-flip",
              "descend":true,
              "preserve3d":true,
              "stepsA":[ 
              {"wait": "300ms"},
              
              {
                  "opacity": 0
              }
              ,
              {
                  "transition": "transform 500ms linear 0", "rotateX": "0deg", "rotateY": "90deg", "rotateZ": "0deg"
              }
              ],
              "stepsB":[]
          };

	ix.run(trigger1, card);
	ix.run(trigger2, card);
}

function triggerTick(index) {
	var card = getCardForIndex(index);
	var tickTrigger = {
              "type":"click",
              "selector":".correct-image",
              "descend":true,
              "preserve3d":true,
              "stepsA":[ {
                  "wait": "600ms"
              }
              ,
              {
                  "display": "block", "opacity": 1, "transition": "opacity 200 ease 0, transform 200 ease 0", "scaleX": 1.16, "scaleY": 1.16, "scaleZ": 1
              }
              ,
              {
                  "transition": "transform 200 ease 0", "scaleX": 1, "scaleY": 1, "scaleZ": 1
              }
              ],
              "stepsB":[]
          };
    ix.run(tickTrigger, card);
}


function getCardForIndex(index) {
	if (isOneToFour) {
		return $("[game-data-index='" + index + "']").parent("a");

	} else {
		return $("._5-6-grade-new [game-data-index='" + index + "']").parent("a");
	}
}


function getCardIndex(card) {
	var index = parseInt($(card).attr("game-data-index"));
	return index;
}
function getCardName(cardIndex) {
	
	if (cardIndex < gameState.cards.length) {
		return gameState.cards[cardIndex].name;
	}
	return;
}

function shuffleCards() {
	var cardUsage = [];
	var cardsInPosition = [];

	//initialise cardUsage
	for (var i = 0; i < cardTypes.length; i++) {
		cardUsage.push(0);
	}

	while (cardUsage.length < cardTypes.length || !areAllCardsUsed(cardUsage)) {
		var cardIndex = Math.floor((Math.random() * cardTypes.length));
		var positionIndex = Math.floor((Math.random() * (2 * cardTypes.length)));

		//all cards of type used
		if (cardUsage[cardIndex] === 2) {
			continue; 
		//card already assigned to position
		} else if (cardsInPosition[positionIndex]) {
			continue;
		} else {
			cardUsage[cardIndex]++;
			cardsInPosition[positionIndex] = cardTypes[cardIndex];

			//set card in gameState
			gameState.cards[positionIndex] = {name: cardTypes[cardIndex], matched: false, faceUp: false};
		}
	}
	

	$("div.card-wrapper a._5-6-grade ._5-6-flip").each(function(index) {
		$(this).removeClass(cardTypesStr);
		$(this).addClass(cardsInPosition[index]);

		//add an index variable
		$(this).attr("game-data-index", index);
	});
}

function areAllCardsUsed(cardsUsed) {
	for (var i = 0; i < cardsUsed.length; i++) {
		if (!cardsUsed[i] || cardsUsed[i] <  2) {
			return false;
		}
	}
	return true;
}

//trigger tick for drop game
function triggerTickForDropGame(droppableElement) {
	var tickTrigger = {
              "type":"click",
              "selector":".correct-image",
              "descend":true,
              "preserve3d":true,
              "stepsA":[ {
                  "wait": "600ms"
              }
              ,
              {
                  "display": "block", "opacity": 1, "transition": "opacity 200 ease 0, transform 200 ease 0", "scaleX": 1.16, "scaleY": 1.16, "scaleZ": 1
              }
              ,
              {
                  "transition": "transform 200 ease 0", "scaleX": 1, "scaleY": 1, "scaleZ": 1
              }
              ],
              "stepsB":[]
          };
    ix.run(tickTrigger, $(droppableElement));
}


function getFilenameFromUrl(url) {
	if (!url) {
		return;
	}

	var fileUrl = url;
	//if absolute url
	var absoluteUrlRegex = new RegExp("webflow", "i");
	var regex;
	if (absoluteUrlRegex.test(url)) {
		regex = new RegExp(".*\/[^_]+_*([^\/]+)$");

		//replace %20s with hyphens
		fileUrl = fileUrl.replace(/%20/g, "-");
	} else {
		regex = new RegExp(".*\/([^\/]+)$");
	}

	var filename = fileUrl.replace(regex, "$1");
	console.log("FILENAME IS " + filename);
	return filename;
}

function shuffleDragCards() {
	var imgSources = [];
	$("div.draggable a._1-4-grade img").each(function(index) {
		imgSources.push($(this).attr("src"));
	});

	shuffleArray(imgSources);

	$("div.draggable a._1-4-grade img").each(function(index) {
		$(this).attr("src", imgSources[index]);
	});

}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

//check if all cards are dragged onto correct targets for drag game
function isDragGameComplete() {
	var gameFinished = true;
	$("div.draggable").each(function() {
		if (!$(this).hasClass("dropped")) {
			gameFinished = false;
		}
	});
	return gameFinished;
}

