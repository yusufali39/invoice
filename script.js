$(document).ready(function () {
  var items = [];
  var customerName = ""; // Variable to store customer name

  $("#item-form").on("submit", addItemToCart);
  $("#cart-table").on("click", ".btn-danger", removeItemFromCart);
  $("#generate-invoice").on("click", generateInvoice);

  function addItemToCart(event) {
    event.preventDefault();

    var itemName = $("#item-name").val();
    var itemPrice = $("#item-price").val();
    var itemQty = parseInt($("#item-qty").val()); // Parse quantity as integer

    if (
      customerName.trim() !== "" &&
      itemName.trim() !== "" &&
      itemPrice.trim() !== ""
    ) {
      var item = {
        name: itemName,
        price: parseFloat(itemPrice),
        qty: itemQty, // Store quantity in item object
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
      updateTotalCost();
      updateTotalQty(); // Update total quantity
      $("#item-name").val("");
      $("#item-price").val("");
      $("#item-qty").val("");
    } else {
      alert("Please enter customer name, item name, and item price.");
    }
  }

  function removeItemFromCart() {
    updateTotalCost();
    updateTotalQty(); // Update total quantity
    var index = $(this).closest("tr").index();
    items.splice(index, 1);
    $(this).closest("tr").remove();
  }

  function updateTotalCost() {
    var totalCost = 0;
    items.forEach(function (item) {
      totalCost += item.price * item.qty; // Update total cost based on quantity
    });
    $("#total-cost").text("Total Cost: ₹" + totalCost.toFixed(2)); // Change currency to rupee (₹)
  }

  function updateTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
      totalQty += item.qty; // Calculate total quantity of all items
    });
    $("#total-qty").text("Total Qty: " + totalQty);
  }

  function generateInvoice() {
    var invoice = `
    <html>
    <head>
        <title>Invoice</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    </head>
    <body>
        <div class="container mt-5">
            <h3 class="text-center mb-0">Ramadan Garments</h3>
            <p class="text-center mb-0">Thana road, siwan</p>
            <p class="text-center mt-0">8294257086</p>
            <p class="mb-0"><strong>Bill to: </strong> ${customerName}</p>
            <p><strong>Date:</strong> ${getCurrentDate()}</p>
            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>`;

    items.forEach(function (item) {
      invoice += `<tr><td>${item.name}</td><td>₹${item.price.toFixed(
        2
      )}</td><td>${item.qty}</td><td>₹${(item.price * item.qty).toFixed(
        2
      )}</td></tr>`;
    });

    invoice += `</tbody></table><footer><p class="mb-0">Total Qty: ${getTotalQty()}</p><p>Total Cost: ₹${getTotalCost()}</p>
    <p id="print-button" class="text-center">happy shopping</p></footer></div></body><script>
      document.getElementById('print-button').addEventListener('click', function () {
          window.print();
      });
      </script></html>`;

    var popup = window.open("", "_blank");
    popup.document.open();
    popup.document.write(invoice);
    popup.document.close();
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
    return totalCost.toFixed(2);
  }

  // Function to update customer name
  $("#customer-name").on("input", function () {
    customerName = $(this).val();
  });
});
