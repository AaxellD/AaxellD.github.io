// -----------GOAL-----------------//
// Pull financial information from company, run a few math algorithms to determine
// value of the company and whether or not it will be worth investing in.
// 
// STEP #1:
// User will type in a stock
// 
// STEP #2:
// Form submits request to API for information about that company
// 
// STEP #3:
// Map data in a way that we can run some Math functions on them.
// 
// STEP #4:
// Return Calculated Value from math functions and data summary underneath.
//  (e.g): (BUY) - Company: MSFT, Income:$11.6bill, Revenue: $36.9bill, etc..


/////////////////////////////////////////////////////////////////
///--------------------------START-----------------------------//
/////////////////////////////////////////////////////////////////


//---------MODAL SECTION----------------//
const $modal = $('#modal')
const $openModal = $('#openModal');
const $closeModal = $('#closeModal');

const closeModal = () => {
    $modal.css('display', 'none');
}

const openModal = () => {
    $modal.css('display', 'block');
}

$openModal.on('click', openModal);
$closeModal.on('click', closeModal);


// // ----- SET INITIAL VARIABLES------//

//--- GET DATE FOR API's
const date = new Date();

const month = (x) => {
    if (x.getMonth() < 9) {
        return `0${x.getMonth() + 1}`
    } else {
        return x.getMonth();
    }
}

////////////// MATH FUNCTIONS ///////////////

// // ---- AVERAGE FUNCTION ---- // //
findAvg = (a, b) => { return (a + b) / 2; };
roundAvg = (x) => { return (Math.floor(x * 100)) / 100 }

///////////// MISC THINGS //////////////////

// LINE SEPRATOR
let $line = $('<hr>').addClass('line')

// Attach api date format to variable
const dateToday = `${date.getFullYear()}-${month(date)}-${date.getDate()} ${date.getHours() - 1}:00`;
console.log(`The date is: ` + dateToday);
const shortToday = `${date.getFullYear()}-${month(date)}-${date.getDate()}`;

// create div element and add data + text
const createStockBlock = (x) => {
    // BOX
    let $box = $('<div>').addClass('box');
    $('.statBox').append($box, $line);
    $box.append(x);
}

/////////////////////////////////////////////////////////////////
///------------------------FORM START--------------------------//
////---------------------------------------------------------////
// Form events should take stock/company and produce a summary of financials.
$('form').on('submit', (event) => {
    event.preventDefault();

    // // COLLECT USER INPUT
    const userInput = $('#input-field').val();

          /////////////////////// TEST START
        // Create wrapper for stock stats and info
        let $stockBlock = $('<div>').addClass('stockBlock');
        $('#theBox').append($stockBlock);
       
        // Function to create stock stat box inside wrapper.
        let $statBox = $('<div>').addClass('statBox').css('display', 'none');
        $stockBlock.append($statBox);


        // Create 3 sections
        let $CurrentStatBox = $('<div>').addClass('curStats stats');
        let $AvgStatBox = $('<div>').addClass('avgStats');
        let $calcBox = $('<div>').addClass('calcStats');

        $statBox.append($CurrentStatBox, $AvgStatBox, $calcBox);
        // Collect User info and set it to Title of Stock Block


        $stockDate = $('<h4>').text(`Date of Info: ${shortToday}`)
        $stockBlock.append($stockDate)
            /////////////////////////// TEST END
        
    // // REQUEST #1 - IEXAPIS - COMPANY INFO;
    $.ajax({
        url: `https://cloud.iexapis.com/stable/stock/${userInput}/company?token=pk_98abe0fd9e4b4f7fbb4d3ed68c0dad8f`
    }).done(
        (data) => {
            $stockBlock.prepend($('<h2>').text(data.companyName))
        }
    );

    // // Request #2 - IEXAPIS - Logo;
    $.ajax({
        url:`https://cloud.iexapis.com/stable/stock/${userInput}/logo?token=pk_98abe0fd9e4b4f7fbb4d3ed68c0dad8f`
    }).done(
        (data)=>{
            let $logo = $('<img>').attr('src',`${data['url']}`).addClass('logo');
            $stockBlock.prepend($logo);
        }
    )

    // // REQUEST #3 - IEXAPIS - Intra-Day Prices;
    $.ajax({
        url: `https://cloud.iexapis.com/stable/stock/${userInput}/intraday-prices?token=pk_98abe0fd9e4b4f7fbb4d3ed68c0dad8f`
    }).done(
        (data) => {

            // cp = current price ... cpHigh ('current price high')
            let $cpHigh = $('<p>').text(`Current High: ${data[0]['high']}`);
            let $cpLow = $('<p>').text(`Current Low: ${data[0]['low']}`);
            let $cpClose = $('<p>').text(`Current Close: ${data[0]['close']}`);
            let $cVolume = $('<p>').text(`Today's Volume: ${data[0]['volume']}`);
            let $cTotalVol = $('<p>').text(`Today's Trade #: ${data[0]['numberOfTrades']}`);
            // Append All items to Current Stat Box
            $CurrentStatBox.append($('<h2>').text('Current'),$cpHigh, $cpLow, $cpClose, $cVolume, $cTotalVol);

            //// ----------- FIND AVERAGES -------//// 

            //----list arrays----//
            priceListHigh = [];
            priceListLow = [];
            priceListClose = [];
            volumeList = [];
            tradeVolume = [];

            //// --- Run 30 times and push to List ---///
            for (let y = 0; y < 30; y++) {
                // High Prices for 30 days
                priceListHigh.push(data[y]['high']);
                // Low Prices for 30 days
                priceListLow.push(data[y]['low']);
                // Price close for 30 days
                priceListClose.push(data[y]['close']);
                // Volume of trades for 30 days
                volumeList.push(data[y]['volume']);
                // # of trades for 30 days
                tradeVolume.push(data[y]['numberOfTrades']);
            }

            // Find averages
            
            const highPrice = roundAvg(priceListHigh.reduce(findAvg));
            let $highPrice = $('<p>').text('AvG: ' + highPrice);
    
            let lowPrice = roundAvg(priceListLow.reduce(findAvg));
            let $lowPrice = $('<p>').text('AvG: ' + lowPrice);

            let closePrice = roundAvg(priceListClose.reduce(findAvg));
            let $closePrice = $('<p>').text('AvG: ' + closePrice);

            let volume = roundAvg(volumeList.reduce(findAvg))
            let $volume = $('<p>').text('AvG: ' + volume);

            let numTrades = roundAvg(tradeVolume.reduce(findAvg));
            let $numTrades = $('<p>').text('AvG: ' + numTrades);

            $AvgStatBox.append($('<h2>').text('30/Day MA'),$highPrice, $lowPrice, $closePrice, $volume, $numTrades);

            //// ----------- Calculations -------//// 


        }
    );


    // TOGGLE -display toggle for stats;
    $stockBlock.on('click', () => {
        $statBox.toggle();
    })

    // CLEAR INPUT FIELD
    $('form').trigger('reset');
})
//---------------- END FORM BUTTON -------------------///




