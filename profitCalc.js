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
    var timeStr = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    var invoice = `
      <html>
        <head>
          <title>Invoice</title>
        </head>
        <body>
          <h3>Invoice for ${customerName}</h3>
          <p>Customer Number: ${customerNumber}</p>
          <table>
            <thead>
              <tr>
                <th>SN</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item, index) =>
                    `<tr>
                      <td>${index + 1}</td>
                      <td>${item.name}</td>
                      <td>${item.qty}</td>
                      <td>₹${item.price.toFixed(2)}</td>
                      <td>₹${(item.price * item.qty).toFixed(2)}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <p>Total: ₹${totalCost.toFixed(2)}</p>
          <p>Prev Dues: ₹${prevDues.toFixed(2)}</p>
          <p>Current Dues: ₹${currentDue.toFixed(2)}</p>
        </body>
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

    var totalCost = getTotalCost();
    var totalAmt = totalCost + prevDues;
    var currentDue = totalAmt - amountPaid;
    var totalQty = getTotalQty();

    var whatsappMessage = `Hi ${customerName},\n\nYour Invoice:\nTotal Qty: ${totalQty}\nTotal Amount: ₹${totalAmt.toFixed(2)}\nCurrent Due: ₹${currentDue.toFixed(
      2
    )}\n\nThank you for shopping with us!`;

    var whatsappUrl = `https://api.whatsapp.com/send?phone=${customerNumber}&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");
  }

  // Event Listeners for Customer Name and Number Inputs
  $("#customer-name").on("input", function () {
    customerName = $(this).val();
  });

  $("#customer-number").on("input", function () {
    customerNumber = $(this).val();
  });
});
