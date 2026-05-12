$(document).ready(function () {

  var items = JSON.parse(localStorage.getItem("profitItems")) || [];
  var customerName = localStorage.getItem("customerName") || "";

  $("#customer-name").val(customerName);

  renderTable();

  $("#item-form").on("submit", addItemToCart);
  $("#cart-table").on("click", ".btn-danger", removeItemFromCart);
  $("#generate-invoice").on("click", generateInvoice);
  $("#clear-cart").on("click", clearAllItems);

  function saveData() {
    localStorage.setItem("profitItems", JSON.stringify(items));
    localStorage.setItem("customerName", customerName);
  }

  function renderTable() {
    $("#cart-table tbody").html("");

    items.forEach(function (item) {
      $("#cart-table tbody").append(
        "<tr><td>" +
        item.name +
        "</td><td>" +
        item.qty +
        "</td><td>₹" +
        item.price.toFixed(2) +
        "</td><td>₹" +
        (item.qty * item.price).toFixed(2) +
        "</td><td>₹" +
        item.sale +
        "</td><td>₹" +
        (item.qty * item.sale).toFixed(2) +
        "</td><td>₹" +
        ((item.qty * item.sale) - (item.qty * item.price)).toFixed(2) +
        '</td><td><button class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td></tr>'
      );
    });

    updateTotalQty();
    updateTotalSale();
    updateTotalCost();
    updateAveragePercentage();
  }

  function addItemToCart(event) {
    event.preventDefault();

    var itemName = $("#item-name").val();
    var itemPrice = $("#item-price").val();
    var itemQty = parseInt($("#item-qty").val());
    var itemSale = parseInt($("#item-sale").val());

    if (
      customerName.trim() !== "" &&
      itemName.trim() !== "" &&
      itemPrice.trim() !== "" &&
      !isNaN(itemQty) &&
      !isNaN(itemSale)
    ) {

      var item = {
        name: itemName,
        price: parseFloat(itemPrice),
        qty: itemQty,
        sale: itemSale
      };

      items.push(item);

      saveData();
      renderTable();

      $("#item-name").val("");
      $("#item-price").val("");
      $("#item-qty").val("");
      $("#item-sale").val("");

          // Focus back to item name input
    $("#item-name").focus();


    } else {
      alert("Please enter valid inputs.");
    }
  }

  function removeItemFromCart() {
    var index = $(this).closest("tr").index();

    items.splice(index, 1);

    saveData();
    renderTable();
  }

  function clearAllItems() {

    if (confirm("Are you sure you want to clear all items?")) {

      items = [];

      localStorage.removeItem("profitItems");

      renderTable();
    }
  }

  function updateTotalQty() {
    var totalQty = 0;

    items.forEach(function (item) {
      totalQty += item.qty;
    });

    $("#total-qty").text("Total Qty: " + totalQty);
  }

  function updateTotalSale() {
    var totalSale = 0;

    items.forEach(function (item) {
      totalSale += item.sale * item.qty;
    });

    $("#total-sale").text("Total Sale: ₹" + totalSale.toFixed(2));
  }

  function updateTotalCost() {
    var totalProfit = 0;

    items.forEach(function (item) {
      totalProfit += (item.qty * item.sale) - (item.qty * item.price);
    });

    $("#total-cost").text("Total Profit: ₹" + totalProfit.toFixed(2));
  }

  function updateAveragePercentage() {

    var totalPurchase = 0;
    var totalProfit = 0;

    items.forEach(function (item) {
      totalPurchase += item.price * item.qty;
      totalProfit += (item.sale * item.qty) - (item.price * item.qty);
    });

    var averagePercentage = 0;

    if (totalPurchase > 0) {
      averagePercentage = (totalProfit / totalPurchase) * 100;
    }

    $("#total-average").text(
      "Average Profit % : " + averagePercentage.toFixed(2) + "%"
    );
  }

  function generateInvoice() {

    var invoice = `
    <html>
    <head>
      <title>Invoice</title>

      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    </head>

    <body>

    <div class="container mt-5">

      <h3 class="text-center mb-0">Ramadan Garments</h3>

      <p class="text-center mb-0">Thana road, siwan</p>

      <p class="text-center mt-0">8294257086</p>

      <p><strong>Customer:</strong> ${customerName}</p>

      <p><strong>Date:</strong> ${getCurrentDate()}</p>

      <table class="table">

        <thead>

          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Purchase</th>
            <th>TPAmount</th>
            <th>Sale</th>
            <th>TSAmount</th>
            <th>Profit</th>
          </tr>

        </thead>

        <tbody>`;

    items.forEach(function (item) {

      invoice += `
      <tr>

        <td>${item.name}</td>

        <td>${item.qty}</td>

        <td>₹${item.price.toFixed(2)}</td>

        <td>₹${(item.qty * item.price).toFixed(2)}</td>

        <td>₹${item.sale}</td>

        <td>₹${(item.qty * item.sale).toFixed(2)}</td>

        <td>₹${((item.qty * item.sale) - (item.qty * item.price)).toFixed(2)}</td>

      </tr>`;
    });

    invoice += `
      </tbody>

      </table>

      <p>Total Qty: ${getTotalQty()}</p>

      <p>Total Sale: ₹${getTotalSale()}</p>

      <p>Total Profit: ₹${getTotalCost()}</p>

      <button onclick="window.print()" class="btn btn-primary">
        Print
      </button>

    </div>

    </body>

    </html>`;

    var popup = window.open("", "_blank");

    popup.document.open();

    popup.document.write(invoice);

    popup.document.close();
  }

  function getCurrentDate() {

    var currentDate = new Date();

    var dd = String(currentDate.getDate()).padStart(2, "0");

    var mm = String(currentDate.getMonth() + 1).padStart(2, "0");

    var yyyy = currentDate.getFullYear();

    return dd + "/" + mm + "/" + yyyy;
  }

  function getTotalSale() {

    var totalSale = 0;

    items.forEach(function (item) {
      totalSale += item.sale * item.qty;
    });

    return totalSale.toFixed(2);
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
      totalCost += (item.qty * item.sale) - (item.qty * item.price);
    });

    return totalCost.toFixed(2);
  }

  $("#customer-name").on("input", function () {

    customerName = $(this).val();

    saveData();
  });

});
