/*
    everything except drawwallet originally coded by owon, made small changes...
 */

function createaddress() {
    /*
     Create NEM address function
     Bitcoinjs version 0.6 draft for alpha version addresses (with filter for signed bug)
     2014-09-16 owon DS
     */

    var randArr = new Uint8Array(32); //create a typed array of 32 bytes (256 bits)
// var retVal = window.crypto.getRandomValues(randArr); //populate array with cryptographically secure random numbers (future use not supported by all current browsers)

    var privateKeyBytes = [];
    for (var i = 0; i < randArr.length; ++i)
//privateKeyBytes[i] = randArr[i]
        privateKeyBytes[i] = (Math.floor(Math.random() * 256)); // not cryptographically secure but should be ok for alpha client


// testdata - edit if you would like to test with a specific private key
// var privateKeyHex = "00d80d58eae724100b5573d9d5fdfb06ab17c94669eb83285363b4a2b8e3e9f247"
// var privateKeyBytes = Crypto.util.hexToBytes(privateKeyHex)

// hex string of our private key
    var privateKeyHex = Crypto.util.bytesToHex(privateKeyBytes).toUpperCase();
//console.log("Private Key Hex:" + privateKeyHex);

// create compressed public key
    var eckey = new Bitcoin.ECKey(privateKeyBytes);
    eckey.compressed = true;
    var publicKeyHexCompressed = Crypto.util.bytesToHex(eckey.getPub());
// console.log("Pub Key compressed Hex:" + publicKeyHexCompressed.toUpperCase());
    var publicKeyBytes = eckey.getPub();
//console.log("Pub Key compressed Bytes:" + publicKeyBytes);

// SHA3
    var words = CryptoJS.enc.Hex.parse(publicKeyHexCompressed);
    var keccakhex = CryptoJS.SHA3(words, { outputLength: 256 }).toString();
//console.log("Public Key SHA3:" + keccakhex.toUpperCase());

// RIPEMD160
    var hash160 = Crypto.RIPEMD160(Crypto.util.hexToBytes(keccakhex));
//console.log("Public Key Hash160(SHA3):" + hash160.toUpperCase());

// add version byte
    var version ="98";
    var hashandversion = version.concat(hash160);
//console.log("Version Hex:" + version);
//console.log("HashandVersion:" + hashandversion.toUpperCase());

// create checksum
    var words1 = CryptoJS.enc.Hex.parse(hashandversion);
    var fullChecksum = CryptoJS.SHA3(words1, { outputLength: 256 }).toString();
    var addressChecksum = fullChecksum.substr(0,8);
//console.log("Checksum first 4Bytes of SHA3(HashandVersion):" + addressChecksum.toUpperCase());

// crate unencoded HEX & byte
    var unencodedAddress = hashandversion.concat(addressChecksum);
//console.log("NEM Address unencoded Hex:" + unencodedAddress.toUpperCase());

    var address = (Crypto.util.hexToBytes(unencodedAddress));
//console.log("NEM Address unencoded Bytes:" + address);

// base32 encode address
    var b32 = base32.encode(address);
//console.log("NEM Address Base32 encoded:" + b32.toUpperCase());

    return [b32.toUpperCase(), privateKeyHex]
}

function searchkey(){

    var pattern = "";
    var address = createaddress();
    //if (pattern=null) return [address[0], address[1]];

    while (address[0].indexOf(pattern) < 0) {
        var address = createaddress();
    }
    return [address[0], address[1], address[0].indexOf(pattern)];


}
function display(){
    // output
    document.getElementById("button1").value="Generating, please wait...";
    document.getElementById('txt_privatekey').innerHTML = "Key will be shown here after creation..."
    document.getElementById("txt_address").innerHTML = "The address will be shown here after creation..."
    if (document.getElementById("pattern").value.length > 2 ) {
        alert("Your pattern contains 3 or more chars, it may take some time to find an address...");
    }
    var keypair = searchkey();

    document.getElementById('txt_privatekey').innerHTML = keypair[1];

    var addr_out = keypair[0].replace(document.getElementById("pattern").value.toUpperCase(),"<font color='#FF0000'>" + document.getElementById("pattern").value.toUpperCase() + "</font>");
    document.getElementById("txt_address").innerHTML = addr_out;

    document.getElementById("button1").value="> Generate new NEM address <";
}

drawqrcode = function(ctx,x,y,w,h,a,val){
    $('body').append('<canvas  width="'+a+'" height="'+a+'" id="qrcode"><canvas>');
    $('#qrcode').qrcode({
        'render' : 'canvas',
        "width": a,
        "height": a,
        "color": "black",
        "text": val
    });

    var img = new Image();
    var t_canvas = document.getElementById('qrcode');

    img.src = t_canvas.toDataURL("image/png");
    img.onload = function(){
        ctx.drawImage(img,0,0,a,a,x,y,w,h);
    }
    $('#qrcode').remove();
}


function drawwallet(canvasid,background){

    var canvas = document.getElementById(canvasid);
    var ctx = canvas.getContext('2d');

    // drawImage to Canvas
    canvas.width = 800;
    canvas.height = 400;
    var img = new Image;
    img.onload = function(){
        ctx.scale(1,1);
        ctx.drawImage(img,0,0); // offset 0,0

        var keypair = searchkey();

        var publickey = keypair[0];
        var privkey = keypair[1];

        ctx.fillStyle = "#000000";
        ctx.font = "25px Arial";
        ctx.fillText("Public Key",70,40);
        ctx.fillText("Private Key",520,40);


        ctx.fillStyle = "white";
        ctx.fillRect(90,70,200,200);
        drawqrcode(ctx,90,70,200,200,200,publickey);

        ctx.fillRect(524,124,256,256);
        drawqrcode(ctx,524,124,256,256,200,privkey);

        ctx.rotate(Math.PI*2/(i*6));
        ctx.font = "12px Arial"
        ctx.fillStyle = "#000"


        ctx.save();
        ctx.rotate(0-Math.PI/2);
        ctx.textAlign = "right";
        ctx.fillText(publickey, -20, 50, 400);
        ctx.restore();


        ctx.save();
        ctx.rotate(0-Math.PI/2);
        ctx.textAlign = "right";
        ctx.fillText(privkey.substr(0,20), -20, 490, 400);
        ctx.fillText(privkey.substr(20,99), -20, 510, 400);
        ctx.restore();
    };
    img.src = './assets/img/' + background;



}