$(document).ready(function () {
  var items = JSON.parse(localStorage.getItem("items")) || [];
  var customerName = localStorage.getItem("customerName") || "";
  var customerNumber = localStorage.getItem("customerNumber") || "";
  var prevDues = parseFloat(localStorage.getItem("prevDues")) || 0;
  var amountPaid = parseFloat(localStorage.getItem("amountPaid")) || 0;

  // Load data from localStorage on page load
  if (items.length > 0) {
    items.forEach(function (item) {
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
    });
    updateTotalCost();
    updateTotalQty();
    updateTotalAmt();
  }

  $("#item-form").on("submit", addItemToCart);
  $("#cart-table").on("click", ".btn-danger", removeItemFromCart);
  $("#generate-invoice").on("click", generateInvoice);

  // Clear button functionality
  $("#clear-button").on("click", function () {
    if (confirm("Are you sure you want to clear all records?")) {
      items = [];
      customerName = "";
      customerNumber = "";
      prevDues = 0;
      amountPaid = 0;

      // Clear localStorage
      localStorage.clear();

      // Reset the UI
      $("#cart-table tbody").empty();
      $("#total-cost").text("Amount: ₹0.00");
      $("#total-amount").text("TOTAL : ₹0.00");
      $("#current-due").text("Current Due: ₹0.00");
      $("#total-qty").text("Total Qty: 0");
      $("#prev-dues").val("");
      $("#amount-paid").val("");
      $("#customer-name").val("");
      $("#customer-number").val("");

      alert("All records have been cleared!");
    }
  });

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
          '</td><td><button class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td></tr>'
      );
      updateTotalCost();
      updateTotalQty();
      updateTotalAmt();

      $("#item-name").val("");
      $("#item-price").val("");
      $("#item-qty").val("");

      // Focus the cursor back to the "item name" input field
      $("#item-name").focus();

      saveDataToLocalStorage();
    } else {
      alert("Customer name, item name, and item price are required.");
    }
  }

  function removeItemFromCart() {
    var row = $(this).closest("tr");
    var index = row.index(); // Find the index of the row to remove

    if (index >= 0) {
      // Get the price and quantity of the item to be removed
      var itemPrice = parseFloat(items[index].price);
      var itemQty = parseInt(items[index].qty);

      // Subtract the item's amount from the total cost
      var itemTotal = itemPrice * itemQty;

      // Remove the item from the `items` array
      items.splice(index, 1);

      // Remove the corresponding row from the table
      row.remove();

      // Update total cost and amount
      updateTotalCost();
      updateTotalQty();
      updateTotalAmt(); // This will reflect the updated total including dues

      // Log the adjustment for debugging purposes (optional)
      console.log(`Removed item: ${itemTotal} subtracted from total.`);

      saveDataToLocalStorage();
    }
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
    saveDataToLocalStorage();
  });

  $("#amount-paid").on("input", function () {
    amountPaid = parseFloat($(this).val()) || 0;
    updateCurrentDue();
    saveDataToLocalStorage();
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

  function generateInvoice() {
    var totalCost = getTotalCost();
    var totalAmt = totalCost + prevDues;
    var currentDue = totalAmt - amountPaid;
    var totalQty = getTotalQty();

    var invoice = `
    <html>
    <head>
        <title>Invoice</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js" defer></script>
      </head>
    <body>
        <div class="container mt-1">
            <h3 class="text-center mb-0"><strong>𝐉𝐔𝐍𝐄𝐃 𝐑𝐄𝐀𝐃𝐘𝐌𝐀𝐃𝐄 𝐂𝐄𝐍𝐓𝐑𝐄</strong></h3>
            <p class="text-center mb-0">TELHATTA ROAD, SIWAN; 𝙋𝙃: 8294257086</p>
            <hr style="border: 1px solid">
            <p><strong>Customer:</strong> ${customerName} (${customerNumber})</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateInvoiceRows()}
                </tbody>
            </table>
            
            <p>Total Qty: ${totalQty}</p>
            <p>Total Amount: ₹${totalCost.toFixed(2)}</p>
            <p>Previous Dues: ₹${prevDues.toFixed(2)}</p>
            <p>Total Due: ₹${totalAmt.toFixed(2)}</p>
            <p>Amount Paid: ₹${amountPaid.toFixed(2)}</p>
            <p>Current Due: ₹${currentDue.toFixed(2)}</p>
        </div>
    </body>
</html>
`;

    var element = document.createElement("div");
    element.innerHTML = invoice;
    html2pdf().from(element).save();
  }

  function generateInvoiceRows() {
    var rows = "";

    items.forEach(function (item) {
      rows += `
        <tr>
            <td>${item.name}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td>₹${(item.price * item.qty).toFixed(2)}</td>
        </tr>
      `;
    });

    return rows;
  }

  function getTotalCost() {
    return items.reduce(function (total, item) {
      return total + item.price * item.qty;
    }, 0);
  }

  function getTotalQty() {
    return items.reduce(function (total, item) {
      return total + item.qty;
    }, 0);
  }

  // Save data to localStorage
  function saveDataToLocalStorage() {
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("customerName", customerName);
    localStorage.setItem("customerNumber", customerNumber);
    localStorage.setItem("prevDues", prevDues);
    localStorage.setItem("amountPaid", amountPaid);
  }
});
