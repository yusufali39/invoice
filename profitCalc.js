$(document).ready(function () {   
  var items = [];
  var customerName = "";
  var customerNumber = "";
  var prevDues = 0;
  var amountPaid = 0;

  // Event Handlers
  $("#item-form").on("submit", addItemToCart);
  $("#cart-table").on("click", ".btn-danger", removeItemFromCart);
  $("#generate-invoice").on("click", generateInvoice);
  $("#generate-whatsapp").on("click", generateWhatsAppBill);

  $("#item-form input").on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      addItemToCart(e); // Trigger the addItemToCart function
    }
  });

  // Function to Add Item to Cart
  function addItemToCart(event) {
    event.preventDefault();
    var itemName = $("#item-name").val().toUpperCase();
    var itemPrice = $("#item-price").val();
    var itemQty = parseInt($("#item-qty").val());

    if (customerName.trim() !== "" && itemName.trim() !== "" && itemPrice.trim() !== "") {
      var item = {
        name: itemName,
        price: parseFloat(itemPrice),
        qty: itemQty,
      };
      items.push(item);
      $("#cart-table tbody").append(
        `<tr>
          <td>${item.name}</td>
          <td>₹${item.price.toFixed(2)}</td>
          <td>${item.qty}</td>
          <td>₹${(item.price * item.qty).toFixed(2)}</td>
          <td><button class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td>
        </tr>`
      );

      updateTotalCost();
      updateTotalQty();
      updateTotalAmt();

      // Clear input fields
      $("#item-name").val("");
      $("#item-price").val("");
      $("#item-qty").val("");
      $("#item-name").focus();
    } else {
      alert("Please fill in customer name, item name, and item price.");
    }
  }

  // Function to Remove Item from Cart
  function removeItemFromCart() {
    var index = $(this).closest("tr").index();
    items.splice(index, 1);
    $(this).closest("tr").remove();
    updateTotalCost();
    updateTotalQty();
    updateTotalAmt();
  }

  // Function to Update Total Cost
  function updateTotalCost() {
    var totalCost = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    $("#total-cost").text("Amount: ₹" + totalCost.toFixed(2));
  }

  // Event Listener for Previous Dues Input
  $("#prev-dues").on("input", function () {
    prevDues = parseFloat($(this).val()) || 0;
    updateTotalAmt();
  });

  // Event Listener for Amount Paid Input
  $("#amount-paid").on("input", function () {
    amountPaid = parseFloat($(this).val()) || 0;
    updateCurrentDue();
  });

  // Function to Update Total Amount
  function updateTotalAmt() {
    var totalAmt = items.reduce((sum, item) => sum + item.price * item.qty, 0) + prevDues;
    $("#total-amount").text("TOTAL : ₹" + totalAmt.toFixed(2));
    updateCurrentDue();
  }

  // Function to Update Current Due
  function updateCurrentDue() {
    var totalAmt = parseFloat($("#total-amount").text().split("₹")[1]) || 0;
    var currentDue = totalAmt - amountPaid;
    $("#current-due").text("Current Due: ₹" + currentDue.toFixed(2));
  }

  // Function to Update Total Quantity
  function updateTotalQty() {
    var totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    $("#total-qty").text("Total Qty: " + totalQty);
  }

  // Function to Generate Invoice
  function generateInvoice() {
    var totalCost = getTotalCost();
    var totalAmt = totalCost + prevDues;
    var currentDue = totalAmt - amountPaid;
    var totalQty = getTotalQty();

    var currentTime = new Date();
    var timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    var invoice = `
      <html>
      <head>
          <title>Invoice</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js" defer></script>
      </head>
      <body>
          <div class="container mt-1">
              <h3 class="text-center mb-0"><strong>𝐉𝐔𝐍𝐄𝐃 𝐑𝐄𝐀𝐃𝐘𝐌𝐀𝐃𝐄 𝐂𝐄𝐍𝐓𝐑𝐄</strong></h3>
              <p class="text-center mb-0">TELHATTA ROAD, SIWAN; 𝙋𝙃: 8294257086</p>
              <hr style="border: none; border-top: 1px dotted #000; width: 100%;" />
              <div style="display: flex; justify-content: space-between;">
                  <p><strong>BILL TO: </strong>${customerName}</p>
                  <p><strong>No.: </strong>${customerNumber}</p>
              </div>
              <div style="display: flex; justify-content: space-between;">
                  <p><strong>DATE:</strong> ${getCurrentDate()}</p>
                  <p><strong>TM:</strong> ${timeStr}</p>
              </div>
              <hr style="border: none; border-top: 1px dotted #000; width: 100%;" />
              <table class="table">
                  <thead>
                      <tr>
                          <th>SN</th>
                          <th>DESCRIPTION</th>
                          <th>QTY</th>
                          <th>RATE</th>
                          <th>AMNT</th>
                      </tr>
                  </thead>
                  <tbody>`;
    items.forEach(function (item, index) {
      invoice += `<tr>
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>₹${(item.price * item.qty).toFixed(2)}</td>
              </tr>`;
    });

    invoice += `</tbody></table>
        <footer>
            <p>TOTAL QTY: ${totalQty}</p>
            <h5>TOTAL: ₹${totalCost.toFixed(2)}</h5>
            <p>DUES: ₹${prevDues.toFixed(2)}</p>
            <h3>TOTAL AMOUNT: ₹${totalAmt.toFixed(2)}</h3>
            <h5>CASH PAID: ₹${amountPaid.toFixed(2)}</h5>
            <h5>CURR DUES: ₹${currentDue.toFixed(2)}</h5>
            <hr style="border: none; border-top: 1px dotted #000;" />
            <p id="print-button" class="text-center">𝙏𝙃𝘼𝙉𝙆𝙎 𝙁𝙊𝙍 𝙑𝙄𝙎𝙄𝙏</p>
        </footer>
        </div>
        <script>
          document.getElementById('print-button').addEventListener('click', function () { window.print(); });
        </script>
        </body>
        </html>`;

    var popup = window.open("", "_blank");
    popup.document.open();
    popup.document.write(invoice);
    popup.document.close();
  }

  // Function to Get Current Date in DD/MM/YYYY format
  function getCurrentDate() {
    var currentDate = new Date();
    var dd = String(currentDate.getDate()).padStart(2, "0");
    var mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    var yyyy = currentDate.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
  }

  // Function to Get Total Quantity
  function getTotalQty() {
    return items.reduce((sum, item) => sum + item.qty, 0);
  }

  // Function to Get Total Cost
  function getTotalCost() {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // Function to Generate WhatsApp Bill
  function generateWhatsAppBill() {
    if (!customerNumber) {
      alert("Please provide a customer number to send the bill via WhatsApp.");
      return;
    }

    // Generate the invoice and convert it to PDF
    var element = document.body; // Or use the specific div you want to convert
    var options = {
      margin: 1,
      filename: `invoice_${customerName || "Customer"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(options).toBlob(function (blob) {
      // Note: Directly sending the PDF via WhatsApp is not possible from client-side JavaScript.
      // Instead, we provide a download link and pre-fill a WhatsApp message.

      // Prompt the user to download the PDF
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = options.filename;
      link.click();

      // Generate a WhatsApp message
      var whatsappMessage = `Hi ${customerName},\nPlease find your bill attached. Please check your downloads for the invoice PDF.`;

      // Generate the WhatsApp URL
      var whatsappUrl = `https://api.whatsapp.com/send?phone=${customerNumber}&text=${encodeURIComponent(whatsappMessage)}`;

      // Open WhatsApp with the message
      window.open(whatsappUrl, "_blank");
    });
  }

  // Event Listeners for Customer Name and Number Inputs
  $("#customer-name").on("input", function () {
    customerName = $(this).val();
  });

  $("#customer-number").on("input", function () {
    customerNumber = $(this).val();
  });
});
