$(document).ready(function () {
  var items = JSON.parse(localStorage.getItem("items")) || [];
  var customerName = localStorage.getItem("customerName") || "";
  var customerNumber = localStorage.getItem("customerNumber") || "";
  var prevDues = parseFloat(localStorage.getItem("prevDues")) || 0;
  var amountPaid = parseFloat(localStorage.getItem("amountPaid")) || 0;

  var addStamp = false;

  $("#stamp-button").on("click", function() {
    addStamp = true;
    alert("Stamp will be added to the invoice.");
  });

  $("#customer-name").val(customerName);
  $("#customer-number").val(customerNumber);
  $("#prev-dues").val(prevDues);
  $("#amount-paid").val(amountPaid);

  renderCart();
  updateTotalCost();
  updateTotalQty();
  updateTotalAmt();

  $("#clear-button").on("click", function(event) {
    event.preventDefault();
    clearAllInputs();
});

  $("#item-form").on("submit", addItemToCart);
  $("#cart-table").on("click", ".btn-danger", removeItemFromCart);
  $("#generate-invoice").on("click", generateInvoice);
  $("#generate-whatsapp").on("click", generateWhatsAppBill);

  $(".item-button").on("click", function (event) {
    event.preventDefault();
    var selectedItem = $(this).text();
    $("#item-name").val(selectedItem);
  });

  function addItemToCart(event) {
    event.preventDefault();

    var itemName = $("#item-name").val();
    var itemPrice = $("#item-price").val();
    var itemQty = parseInt($("#item-qty").val());

    if (
        customerName.trim() !== "" &&
        itemName.trim() !== "" &&
        itemPrice.trim() !== ""
    ) {
        var item = {
            name: itemName,
            price: parseFloat(itemPrice),
            qty: itemQty,
        };


        items.push(item);
        $("#cart-table tbody").append(
            "<tr><td>" +
            item.name +
            "</td><td>₹" +
            item.price.toFixed(2) +
            "</td><td>" +
            item.qty +
            "</td><td>₹" +
            (item.price * item.qty).toFixed(2) +
            '</td><td><button class= "btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td></tr>'
        );
        localStorage.setItem("items", JSON.stringify(items)); 
        renderCart();
        updateTotalCost();
        updateTotalQty();
        updateTotalAmt();
        
        // Clear input fields
        $("#item-name").val("");
        $("#item-price").val("");
        $("#item-qty").val("");

        // Move focus back to the item name input field
        $("#item-name").focus();
    } else {
        alert("Customer name, item name, and item price are required.");
    }
}


  function removeItemFromCart() {
    var row = $(this).closest("tr");
    var index = row.index(); // Find the index of the row to remove

    if (index >= 0) {
      var itemPrice = parseFloat(items[index].price);
      var itemQty = parseInt(items[index].qty);

      var itemTotal = itemPrice * itemQty;

      items.splice(index, 1);

      row.remove();
      localStorage.setItem("items", JSON.stringify(items));
      renderCart();
      updateTotalCost();
      updateTotalQty();
      updateTotalAmt(); 

      console.log(`Removed item: ${itemTotal} subtracted from total.`);
    }
  }

  function renderCart() {
    $("#cart-table tbody").empty();
    items.forEach(function (item, index) {
        $("#cart-table tbody").append(
            `<tr>
                <td>${item.name}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>₹${(item.price * item.qty).toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td>
            </tr>`
        );
    });
}

  function updateTotalCost() {
    var totalCost = 0;
    items.forEach(function (item) {
      totalCost += item.price * item.qty;
    });
    $("#total-cost").text("Amount: ₹" + totalCost.toFixed(2));
  }

  $("#prev-dues").on("input", function () {
    prevDues = parseFloat($(this).val()) || 0;
    updateTotalAmt();
  });

  $("#amount-paid").on("input", function () {
    amountPaid = parseFloat($(this).val()) || 0;
    updateCurrentDue();
  });

  // Function to update total amount
  function updateTotalAmt() {
    var totalAmt = 0;
    items.forEach(function (item) {
      totalAmt += item.price * item.qty;
    });
    totalAmt += prevDues;
    $("#total-amount").text("TOTAL : ₹" + totalAmt.toFixed(2));
    updateCurrentDue();
  }
  function updateCurrentDue() {
    var totalAmt = parseFloat($("#total-amount").text().split("₹")[1]) || 0;
    var currentDue = totalAmt - amountPaid;
    $("#current-due").text("Current Due: ₹" + currentDue.toFixed(2));
  }

  function updateTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
      totalQty += item.qty;
    });
    $("#total-qty").text("Total Qty: " + totalQty);
  }

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var timeStr = hours + ":" + minutes + " " + ampm;

  function generateInvoice() {
    var totalCost = getTotalCost();
    var totalAmt = totalCost + prevDues;
    var currentDue = totalAmt - amountPaid;
    var totalQty = getTotalQty();

    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12 for 12-hour format
    minutes = minutes < 10 ? "0" + minutes : minutes; // Add leading zero if needed
    var timeStr = hours + ":" + minutes + " " + ampm;

    
  var invoice = `
<html>
  <head>
    <title>Invoice</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
 
     <style>
           @font-face {
      font-family: 'Arial Narrow';
      src: local('Arial Narrow'), local('ArialNarrow'),
           url('https://fonts.cdnfonts.com/s/19849/ARIALN.woff') format('woff');
      font-weight: normal;
      font-style: normal;
    }
      /* Print style for an 80mm receipt */
      @media print {
        @page {
          size: 100mm auto;
          margin: 0;
        }
        body {
        font-family: 'Arial Narrow', 'Nimbus Sans Narrow', 'Franklin Gothic Medium', sans-serif !important;
          margin: 0;
        }
      }
      /* On-screen container width */
      .container {
        width: 100mm;
        margin: 0 auto;
      }
      .shop-title {
      font-size: 22px !important; 
      font-weight: 900 !important;
      line-height: 0.5 !important;
      margin: 2mm 0 !important;
      text-transform: uppercase;
  }
      .shop-address {
      line-height: 1.5 !important;
      margin: 2mm 0 !important;
      text-transform: uppercase;
      }
      hr {
      margin: 0.5mm 0 !important;
      }
      .item-list{
      font-weight: 700 !important;
      line-height: 1.0 !important;
      margin: 1mm 0 !important;
      text-transform: uppercase;
      }
      .table{
      line-height: 0.5 !important;
      margin-bottom: 0.3mm 0 !important;
      }
    </style>
    
    <!-- html2pdf script -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js" defer></script>
  </head>
  <body>
    <div class="container mt-1">
      <h3 class="shop-title text-center mb-0" id="savePdfButton"> 
      <img src="1770261049335.png" 
     alt="logo" style="width:350px; height:70px; display:block; margin:0 auto;" /> </h3>
    
      

      <hr class="shop-hr" style="border: none; border-top: 1px dotted #000; width: 100%;" />

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <p class="mb-0"><strong>BILL TO:</strong> ${customerName}</p>
        <p class="mb-0"><strong>No.:</strong> ${customerNumber}</p>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <p class="mb-0"><strong>DATE:</strong> ${getCurrentDate()}</p>
        <p class="text-right mb-0"><strong>TM:</strong> ${timeStr}</p>
      </div>
      <hr style="border: none; border-top: 1px dotted #000; width: 100%; margin-bottom: 0px;" />

      <table class="table">
        <thead>
          <tr>
            <th style="text-align: left;">SN</th>
            <th style="text-align: left;">DESCRIPTION</th>
            <th style="text-align: right;">QTY</th>
            <th style="text-align: right;">RATE</th>
            <th style="text-align: right;">AMNT</th>
          </tr>
        </thead>
        <tbody>`;
      
items.forEach(function (item, index) {
  invoice += `<tr>
                <td class="item-list" style="text-align: left;">${index + 1}</td>
                <td class="item-list" style="text-align: left;">${item.name}</td>
                <td class="item-list" style="text-align: right;">${item.qty}</td>
                <td class="item-list" style="text-align: right;">₹${item.price.toFixed(2)}</td>
                <td class="item-list" style="text-align: right;">₹${(item.price * item.qty).toFixed(2)}</td>
              </tr>`;
});

invoice += `
        </tbody>
      </table>
      <footer>

    <div class="billing" style="display: flex; justify-content: space-between; align-items: center;">
      <p class="mb-0">TOT-QTY: <strong>${getTotalQty()}</strong></p>
      <h5 class="text-right mb-0">TOTAL: <strong>₹ ${totalCost.toFixed(2)}</strong></h5>
      </div>
        <hr style="border: none; border-top: 1px dotted #000; width: 100%;" />
        <h5 style="text-align: left;" class="mb-0">DUES: <span style="float: right;"> ₹${prevDues.toFixed(2)}</span></h5>
        <h5 style="text-align: left;" class="mb-0">TOTAL AMT: <span style="float: right;"> ₹${totalAmt.toFixed(2)}</span></h5>
        <h5 style="text-align: left;" class="mb-0">CASH PAID: <span style="float: right;"> ₹${amountPaid.toFixed(2)}</span></h5>
        <h5 style="text-align: left;" class="mb-0">CURR DUES: <span style="float: right;"> ₹${currentDue.toFixed(2)}</span></h5>

        <hr style="border: none; border-top: 1px dotted #000; width: 100%;" />
        <p id="print-button" class="text-center mb-0">THANKS FOR VISIT</p>
        ${addStamp ? `<div class="text-center" style="margin-top:0;"><img src="Logopit_1750148360789.png" alt="Stamp" style="width:120px;" transform: rotate(-30deg); margin-top:0;"></div>` : ""}
      </footer>
    </div>
  </body>
  <script>
    // Trigger print when "THANKS FOR VISIT" is clicked
    document.getElementById('print-button').addEventListener('click', function () {
      window.print();
    });

    // Save as PDF using custom 80mm page size
    function saveAsPDF() {
      const element = document.body;
      html2pdf(element, {
    margin: 2, 
    filename: 'invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } // Use 'a4' to fit more content
  });
    }
    // Event listener for the save as PDF button
    document.getElementById('savePdfButton').addEventListener('click', saveAsPDF);
  </script>
</html>`;


     var popup = window.open("", "_blank");
    popup.document.open();
    popup.document.write(invoice);
    popup.document.close();
  }
  // Function to Generate WhatsApp Bill
  function generateWhatsAppBill() {
    if (!customerNumber) {
      alert("Please provide a customer number to send the bill via WhatsApp.");
      return;
    }

// Add country code (e.g., India: 91)
const countryCode = "91"; // Change this to your country code
const formattedNumber = `${countryCode}${customerNumber}`;
      
    var totalCost = getTotalCost();
    var totalAmt = totalCost + prevDues;
    var currentDue = totalAmt - amountPaid;
    var totalQty = getTotalQty();

const whatsappMessage = `Hi ${customerName},\n\nYour Invoice:\nTotal Qty: ${totalQty}\nTotal Amount: ₹${totalAmt.toFixed(2)}\nCurrent Due: ₹${currentDue.toFixed(2)}\n\nThank you for shopping with us!`;
      

   // 1. Try WhatsApp Business first
const businessUrl = `whatsapp-business://send?phone=${formattedNumber}&text=${encodeURIComponent(whatsappMessage)}`;
const universalUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(whatsappMessage)}`;

// Open WhatsApp Business and fallback if it fails
const newWindow = window.open(businessUrl, "_blank");

// Check if the window is still open after a short delay (indicates failure)
setTimeout(() => {
  if (newWindow && !newWindow.closed) {
    newWindow.close(); // Close the blank tab
    window.open(universalUrl, "_blank"); // Fallback to universal URL
  }
}, 500); // Adjust delay based on testing
}
  
  function getCurrentDate() {
    var currentDate = new Date();
    var dd = String(currentDate.getDate()).padStart(2, "0");
    var mm = String(currentDate.getMonth() + 1).padStart(2, "0"); // January is 0!
    var yyyy = currentDate.getFullYear();

    return dd + "/" + mm + "/" + yyyy;
  }

  function getTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
      totalQty += item.qty;
    });
    return totalQty;
  }

  function getTotalCost() {
    var totalCost = 0;
    items.forEach(function (item) {
      totalCost += item.price * item.qty;
    });
    return totalCost;
  }

  // Function to update customer name
  $("#customer-name").on("input", function () {
    customerName = $(this).val();
  });
  $("#customer-number").on("input", function () {
    customerNumber = $(this).val();
  });
  

    function clearAllInputs() {
        localStorage.clear();
        items = [];
        customerName = "";
        customerNumber = "";
        prevDues = 0;
        amountPaid = 0;

        $("#customer-name, #customer-number, #prev-dues, #amount-paid, #item-name, #item-price, #item-qty").val("");
        $("#cart-table tbody").empty();
        $("#total-cost").text("Amount: ₹0.00");
        $("#total-amount").text("TOTAL : ₹0.00");
        $("#current-due").text("Current Due: ₹0.00");
        $("#total-qty").text("Total Qty: 0");
        
        // Optional: Force update localStorage
        localStorage.setItem("items", JSON.stringify(items));
        localStorage.setItem("customerName", customerName);
        localStorage.setItem("customerNumber", customerNumber);
        localStorage.setItem("prevDues", prevDues);
        localStorage.setItem("amountPaid", amountPaid);
    }

  
});













