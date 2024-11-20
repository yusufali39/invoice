$(document).ready(function () {
  var items = [];
  var customerName = "";
  var customerNumber = "";
  var prevDues = 0;
  var amountPaid = 0;

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
        "<tr><td>" +
          item.name +
          "</td><td>₹" +
          item.price.toFixed(2) +
          "</td><td>" +
          item.qty +
          "</td><td>₹" +
          (item.price * item.qty).toFixed(2) +
          '</td><td><button class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td></tr>'
      );

      updateTotalCost();
      updateTotalQty();
      updateTotalAmt();

      $("#item-name").val("");
      $("#item-price").val("");
      $("#item-qty").val("");
      $("#item-name").focus();
    } else {
      alert("Please fill in customer name, item name, and item price.");
    }
  }

  function removeItemFromCart() {
    var index = $(this).closest("tr").index();
    items.splice(index, 1);
    $(this).closest("tr").remove();
    updateTotalCost();
    updateTotalQty();
    updateTotalAmt();
  }

  function updateTotalCost() {
    var totalCost = items.reduce((sum, item) => sum + item.price * item.qty, 0);
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

  function updateTotalAmt() {
    var totalAmt = items.reduce((sum, item) => sum + item.price * item.qty, 0) + prevDues;
    $("#total-amount").text("TOTAL : ₹" + totalAmt.toFixed(2));
    updateCurrentDue();
  }

  function updateCurrentDue() {
    var totalAmt = parseFloat($("#total-amount").text().split("₹")[1]) || 0;
    var currentDue = totalAmt - amountPaid;
    $("#current-due").text("Current Due: ₹" + currentDue.toFixed(2));
  }

  function updateTotalQty() {
    var totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    $("#total-qty").text("Total Qty: " + totalQty);
  }

  function generateInvoice() {
    var totalCost = getTotalCost();
    var totalAmt = totalCost + prevDues;
    var currentDue = totalAmt - amountPaid;

    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var timeStr = hours + ":" + minutes + " " + ampm;

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
          <p>TOTAL QTY: ${getTotalQty()}</p>
          <h5>TOTAL: ₹${totalCost.toFixed(2)}</h5>
          <p>DUES: ₹${prevDues.toFixed(2)}</p>
          <h3>TOTAL AMOUNT: ₹${totalAmt.toFixed(2)}</h3>
          <h5>CASH PAID: ₹${amountPaid.toFixed(2)}</h5>
          <h5>CURR DUES: ₹${currentDue.toFixed(2)}</h5>
          <hr style="border: none; border-top: 1px dotted #000;" />
          <p class="text-center">𝙏𝙃𝘼𝙉𝙆𝙎 𝙁𝙊𝙍 𝙑𝙄𝙎𝙄𝙏</p>
      </footer>
      </div>
      </body>
      </html>`;

    var popup = window.open("", "_blank");
    popup.document.open();
    popup.document.write(invoice);
    popup.document.close();
  }

  function generateWhatsAppBill() {
    if (!customerNumber) {
      alert("Please provide a customer number to send the bill via WhatsApp.");
      return;
    }

    var totalCost = getTotalCost();
    var totalAmt = totalCost + prevDues;
    var currentDue = totalAmt - amountPaid;
    var totalQty = getTotalQty();

    var whatsappMessage = `
Hi ${customerName},
Your Invoice Details:
- Total Qty: ${totalQty}
- Total Amount: ₹${totalAmt.toFixed(2)}
- Amount Paid: ₹${amountPaid.toFixed(2)}
- Current Due: ₹${currentDue.toFixed(2)}

Thank you for shopping with us!
`;

    var whatsappUrl = `https://api.whatsapp.com/send?phone=${customerNumber}&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");
  }

  $("#customer-name").on("input", function () {
    customerName = $(this).val();
  });

  $("#customer-number").on("input", function () {
    customerNumber = $(this).val();
  });

  function getCurrentDate() {
    var currentDate = new Date();
    var dd = String(currentDate.getDate()).padStart(2, "0");
    var mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    var yyyy = currentDate.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
  }

  function getTotalQty() {
    return items.reduce((sum, item) => sum + item.qty
                        
