//globals
var isOneToFour = false;

var cardTypes = ["crawl-flip", "heater-flip", "alarm-flip", "_000-flip", "plan-flip", "roll-flip"];
var cardTypesStr = cardTypes.join(" ");


//class name of droppable target mapped to text image sources
var dragGameMatches = {
	crawl: "images/crawl.svg",
	fire: "images/two-metres.svg",
	drop: "images/stop-drop.svg",
	dial: "images/000.svg",
	plan: "images/fireescape.svg",
	firealarm: "images/smokealarm.svg"
}

var dragGameMatchesImgToClass = {
	"images/crawl.svg": "crawl",
	"images/two-metres.svg": "fire",
	"images/stop-drop.svg": "drop",
	"images/000.svg": "dial",
	"images/fireescape.svg": "plan",
	"images/somkealarm.svg": "firealarm"
}

var gameState = {
	cards: [],
	activeCard1: -1,
	activeCard2: -1,
	activeCardIndex1: "",
	activeCardIndex2: "",
	gameComplete: false
}

var ix;

$(document).ready(function() {

	//change data-ix to prevent overlap with webflow js
	$("a[data-ix='cardflip']").attr("data-ix", "cardflop");

	//set the game mode when 1-4 click
	$("[data-w-id=\"42908028-b80c-b3cc-2f08-aec8b38bc4d6\"]").click(function() {
		setGameMode(true);
	});

	//set game mode when 5-6 clicked
	$("[data-w-id=\"266e5054-2754-b083-5e1b-a8a6aa680b88\"]").click(function() {
		setGameMode(false);
	});

	//listeners for 1-4 card flips
	$("a._5-6-grade").click(function() {
		cardClicked($(this));
	});

	shuffleCards();
	initAnimations();
	$(".draggable").draggable({
		revert: function(droppable) {

			//get img src for dragged text
			var src = $(this).find("a._1-4-grade img").attr("src");

			//get matching class
			var matchingClass = dragGameMatchesImgToClass[src];
			if (!matchingClass) {
				//if no match revert
				return true;
			}

			console.log($(droppable).children("div._1-4-grade").attr("class"));
			//test if dropped on correct element
			if ($(droppable).children("div._1-4-grade").hasClass(matchingClass)) {
				//match found, don't revert
				$(this).addClass("dropped");

				//center if correctly dropped
				$(this).position({
					my: "center",
					at: "center",
					of: $(droppable),
					using: function(pos) {
						$(this).animate(pos, 200, "linear");
					}
   				});

   				//trigger tick
   				triggerTickForDropGame(droppable);
				return false;
			}
			return true;

		},
		stack: ".draggable", 
		snap: ".droppable"
	});
	$(".droppable").droppable({accept: ".draggable", drop: function(event, ui) {
		console.log("DROPPED SUCCESFULLY");
		
		
	}} );

	//drag game setup
	
	//$("div._1-4-grade").droppable();
});

function initAnimations() {
	ix = Webflow.require('ix');
	ix.destroy();
}

function setGameMode(isOneToFourGrade) {
	isOneToFour = isOneToFourGrade;
}

function cardClicked(click) {
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
function resetActiveCards() {
	gameState.activeCard1 = -1;
	gameState.activeCard2 = -1;

}
function flipDownActiveCards(card1Index, card2Index) {
	console.log("GOT HERE");
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
                  "opacity": 1, "transition": "opacity 200 ease 0, transform 200 ease 0", "scaleX": 1.16, "scaleY": 1.16, "scaleZ": 1
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
 	return $("[game-data-index='" + index + "']").parent("a");
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
	

	$("div.card-wrapper ._5-6-flip").each(function(index) {
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