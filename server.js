require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(
  cors({
    origin: "https://make-your-portfolio-online.com",
  })
);

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
  [1, { priceInCents: 2999, name: "Personal Website" }],
  [2, { priceInCents: 500, name: "Added Sections" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}`,
    });

    res.json({ url: session.url, success: true });
  } catch (e) {
    res.status(500).json({ error: e.message, success: false });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the homepage");
});

const PORT = process.env.PORT || "3000";
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
