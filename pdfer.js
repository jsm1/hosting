//globals
var margin = 20;
var sideWidth = 125;
var headerWidth = 450;
var logoY = 675;
var headerHeight = 193;
var circleRadius = 10.88;
var fontSize = 13;

var images = {
  sideImage: {
    url: "https://uploads-ssl.webflow.com/5ab471eaed19a3819daa5598/5bc57bd15141986aa2dad4d2_pdf-header-graphic.png"
  },
  header: {
    url: "https://uploads-ssl.webflow.com/5ab471eaed19a3819daa5598/5af5122013ebd65fabd6fea4_checklist-title%402x.png"
  },
  tfsLogo: {
    url: "https://uploads-ssl.webflow.com/5ab471eaed19a3819daa5598/5af512214c01dfaa9997e0a2_tfs-logo-with-text%402x.png"
  }
};

var checklistItems = [
  "Emergency phone number (000) is written on your telephone.",
  "Working smoke alarms are installed in the appropriate areas.",
  "You dust and vacuum your smoke alarms regularly.",
  "Fire blanket and extinguisher is in your home, and checked regularly. You have a home fire escape plan.",
  "You practice the escape plan regularly. Your plan displayed prominently.",
  "You regularly check your appliances and power leads for any malfunctions or damage.",
  "If you have security doors or windows, the keys left in or next to the locks when you are in the house.",
  "You constantly check the kitchen while cooking.",
  "You keep clothing and furnishings away from heaters.",
  "You regularly check your electric blanket.",
  "You switch off any electrical equipment at night prior to going to bed.",
  "You remove flammable materials such as excessive paper or chemicals from your home."
];

var itemsOneToFour = [
  "It is recommended that smoke alarms are in every hallway and bedroom and at the top of the stairs.",
  "Check your smoke alarms every month.",
  "Check your smoke alarms every month and change batteries if needed.",
  "Change your smoke alarm batteries at the end of daylight savings.",
  "ONLY Grown ups should use fire extinguishers and fire blankets.",
  "Always have an escape plan for your house.",
  "Practice your escape plan for your house.",
  "Make sure you know two ways out of every room in your house.",
  "If there is a fire go straight outside and wait at your safe meeting place.",
  "Have house keys in or next to the front and back doors so you can exit quickly in an emergency.",
  "If there is a fire in your house Get Out and Stay Out and DON’T take toys or pets with you. Go to your Safe Meeting Place.",
  "Crawl low and Go Go Go in a smoke filled room.",
  "Call triple zero (000) for help in an emergency.",
  "Stop, Drop, Rock and Roll if your clothes are on fire.",
  "If you find matches or a lighter give them to an grown-up."
];

var itemsFiveToSix = [
  "It is recommended that smoke alarms are in every hallway and bedroom and at the top of the stairs.",
  "If a smoke alarm chirps then the battery needs changing.",
  "Check your smoke alarms every month.",
  "Check your smoke alarms every month and change batteries if needed.",
  "Change your smoke alarm batteries at the end of daylight savings.",
  "ONLY adults should use fire extinguishers and fire blankets.",
  "Always have an escape plan for your house.",
  "Practice your escape plan for your house.",
  "Make sure you know two ways out of every room in your house.",
  "If there is a fire go straight outside and wait at your safe meeting place.",
  "Have house keys in  or next to the front and back doors so you can exit quickly in an emergency.",
  "Crawl low and Go Go Go in a smoke filled room.",
  "Call triple zero (000) for help in an emergency.",
  "Stop, Drop, Rock and Roll if your clothes are on fire.",
  "If you find matches or a lighter give them to an adult.",
  "If there is a fire in your house Get Out and Stay Out and DON’T take toys or pets with you.",
  "ONLY cook if a adult is watching you.",
  "Candles and oil burners should only be used by an adult and put out before going to bed OR leaving the room.",
  "Keep inflammables like curtains, clothing and bedding at least 2 metres from a heater.",
  "Keep clothes dryer lint filters clean.",
  "Clean clothes dryer lint filters after every use."
];

var isOneToFourMode = false;

$(document).ready(function() {

  //set 1-4 mode
  $(".quiz-button-1-4").click(function() {
    setModeOneToFour(true);
  });

  //set 5-6 mode
  $(".quiz-button-5-6").click(function() {
    setModeOneToFour(false);
  });

  //listener for when to generate pdf for 1-4 mode
  $(".generate-pdf-link").click(function() {
    generatePDF();
  });


  //5-6 listener
  /*$("a[data-w-id=\"6768f6cd-7143-cd60-9acb-49d75ff09bee\"]").click(function() {
    generatePDF();
  });*/
});

function setModeOneToFour(oneToFour) {
  isOneToFourMode = oneToFour;
}

function getOneToFourAnswers() {
  var answers = [];
  $("div.yes-no-block").each(function(index) {
    answers[index] = "";
    $(this).find("input.quiz-btn-radio").each(function() {
      if ($(this).prop("checked")) {
        var value = $(this).attr("value");
        var yesRegex = new RegExp("=yes");
        if (yesRegex.test(value)) {
          answers[index] = "yes";
        } else {
          answers[index] = "no";
        }
      }
    });
  });
  return answers;
}

function getFiveToSixAnswers() {
  var answers = [];
  $("div.multi-select-container div.auto-wrapper:not(.q2-success)").each(function(index) {
    answers[index] = "";
    $(this).children("div.multi-option").each(function() {
      var checked = $(this).find("input").prop("checked");
      var img = $(this).find("img[src$='25.svg']");
      if (checked && img.length) {
        console.log("Correct answer for " + index);
        answers[index] = "correct";
      } else if (!answers[index]) {
        answers[index] = "incorrect";
      }
    });
  });
  return answers;
}

function xhrRequestPromise(method, url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.send();
  });
}

function downloadPDF() {
  if (document.querySelector("#download-link").getAttribute("href") !== "#") {
    return;
  }
  generatePDF();
}
function generatePDF() {

  //hide print link while generating
  $("a.print-link").hide();
    // create a document and pipe to a blob
  var doc = new PDFDocument();
  var stream = doc.pipe(blobStream());

  //set document title
  doc.info["Title"] = "TFS-Checklist.pdf";

  var promises = [];
  for (let imgKey of Object.keys(images)) {
    promises.push(xhrRequestPromise('GET', images[imgKey].url));
  }
  
  Promise.all(promises).then(function(data) {
    var c = 0;
    for (let key of Object.keys(images)) {
      images[key].data = data[c];
      c++;
    }
 




    doc.image(Buffer.from(images.sideImage.data), margin, margin, {width: sideWidth});
    doc.image(Buffer.from(images.header.data), sideWidth + margin + margin, margin, {width: headerWidth});
    doc.image(Buffer.from(images.tfsLogo.data), margin, logoY, {width: sideWidth});

    doc.text("", margin + margin + sideWidth + circleRadius, headerHeight + margin + margin)
    .font("Helvetica", fontSize);

    if (isOneToFourMode) {
      var answers = getOneToFourAnswers();
      for (var i = 0; i < answers.length; i++) {
        if (answers[i]) {
          if (answers[i] === "no") {
            writeItem(itemsOneToFour[i], doc);
          }
        }
      }
    } else {
      var answers = getFiveToSixAnswers();
      for (var i = 0; i < answers.length; i++) {
        if (answers[i]) {
          if (answers[i] === "incorrect") {
            writeItem(itemsFiveToSix[i], doc);
          }
        }
      }
    }
    /*
    for (let item of checklistItems) {
      writeItem(item, doc);
    }*/

    doc.end();
  });

  
  stream.on('finish', function() {
    //window.location = stream.toBlobURL("application/pdf");
    /*var iframe = document.querySelector("iframe");
    iframe.src = stream.toBlobURL('application/pdf');

    document.querySelector("#download-link").setAttribute("href", stream.toBlobURL('application/pdf'));
   
   */

    //document.querySelector("#download-link").click();

    //populate iframe
    var iframeId;
    if (isOneToFourMode) {
      iframeId = "iframe-wrapper-1-4";
    } else {
      iframeId = "iframe-wrapper-5-6";
    }
    $("#" + iframeId).html("<iframe src=\"" + stream.toBlobURL("application/pdf") + "\"></iframe>");



    $("a.print-link").attr("href", stream.toBlobURL("application/pdf"));
    $("a.print-link").attr("download", "checklist.pdf");
    $("a.print-link").show();
  });
}


function writeItem(item, doc) {
  
  if (doc.y > (792 - (margin * 4))) {
    doc.addPage();
  }
  doc.save();
  doc.circle(doc.x - (circleRadius *2), doc.y + (1.5 * fontSize) , circleRadius).fill("#fdb913").stroke();
  doc.restore();
  
  doc.moveDown()
    .text(item, {
     width: headerWidth - (2 * margin),
     align: 'left',
     columns: 1,
     height: logoY,
     ellipsis: true
  });
}
