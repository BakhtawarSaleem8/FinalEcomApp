require('dotenv').config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cookieParser = require('cookie-parser');
const { createProduct } = require('./controller/Product');
const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const { User } = require('./model/User');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/common');
const path = require('path');
const { Order } = require('./model/Order');
const process = require('process');
const connectDB = require('./dbconnection')
// Webhook

// const endpointSecret = process.env.ENDPOINT_SECRET;

// server.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   async (request, response) => {
//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//     } catch (err) {
//       response.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }

//     // Handle the event
//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         const paymentIntentSucceeded = event.data.object;

//         const order = await Order.findById(
//           paymentIntentSucceeded.metadata.orderId
//         );
//         order.paymentStatus = 'received';
//         await order.save();

//         break;
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
//   }
// );

// JWT options


const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY; 
//console.log(opts)
//middlewares
server.use(
  cors({
    origin: 'https://final-ecom-app.vercel.app', // Ensure no trailing slash
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count']
  })
);

// Handle preflight requests
// server.options('*', cors());

// server.use(express.static(path.resolve(__dirname, '../dist')));
server.use(cookieParser());
// Ensure proper session config
// server.use(
//   session({
//     secret: process.env.SESSION_KEY,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: true,
//       sameSite: 'none',
//       maxAge: 24 * 60 * 60 * 1000
//     }
//   })
// );
server.use(passport.initialize()); // Required for Passport
server.use(passport.authenticate('session'));




server.use(express.json()); // to parse req.body
// server.use((req, res, next) => {
//   //console.log('--- Request Debug ---');
//   //console.log('Method:', req.method);
//   //console.log('Path:', req.path);
//   //console.log('Cookies:', req.cookies);
//   //console.log('Headers:', req.headers['cookie']);
//   next()}) // to parse req.body


server.use('/products', isAuth(), productsRouter.router);
// we can also use JWT token for client-only auth
server.use('/categories', isAuth(), categoriesRouter.router);
server.use('/brands', isAuth(), brandsRouter.router);
server.use('/users', isAuth(), usersRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart', isAuth(), cartRouter.router);
server.use('/orders', isAuth(), ordersRouter.router);

// this line we add to make react router work in case of other routes doesnt match
// server.get('*', (req, res) =>
//   res.sendFile(path.resolve('build', 'index.html'))
// );

// Passport Strategies
// passport.use(
//   'local',
//   new LocalStrategy({ usernameField: 'email' }, async function (
//     email,
//     password,
//     done
//   ) {
//     // by default passport uses username
//     console.log({ email, password });
//     try {
//       const user = await User.findOne({ email: email });
//       console.log(email, password, user);
//       if (!user) {
//         return done(null, false, { message: 'invalid credentials' }); // for safety
//       }
//       crypto.pbkdf2(
//         password,
//         user.salt,
//         310000,
//         32,
//         'sha256',
//         async function (err, hashedPassword) {
//           if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
//             return done(null, false, { message: 'invalid credentials' });
//           }
//           const token = jwt.sign(
//             sanitizeUser(user),
//             process.env.JWT_SECRET_KEY
//           );
//           done(null, { id: user.id, role: user.role, token }); // this lines sends to serializer
//         }
//       );
//     } catch (err) {
//       done(err);
//     }
//   })
// );
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found:', email); // Debug
        return done(null, false, { message: 'Invalid credentials' });
      }

      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        'sha256',
        async (err, hashedPassword) => {
          if (err) {
            console.log('Password hashing error:', err); // Debug
            return done(err);
          }
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            console.log('Password mismatch for user:', email); // Debug
            return done(null, false, { message: 'Invalid credentials' });
          }
          const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
          done(null, { id: user.id, role: user.role, token });
        }
      );
    } catch (err) {
      console.log('LocalStrategy error:', err); // Debug
      done(err);
    }
  })
);

passport.use(
  'jwt',
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});

// this changes session variable req.user when called from authorized request

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

// Payments

// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_SERVER_KEY);

// server.post('/create-payment-intent', async (req, res) => {
//   const { totalAmount, orderId } = req.body;

//   // Create a PaymentIntent with the order amount and currency
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: Math.round(totalAmount * 100), // for decimal compensation
//     currency: 'inr',
//     // automatic_payment_methods: {
//     //   enabled: true,
//     // },
//      payment_method_types: ['card'],
//   metadata: {
//       orderId,
//     },
//   });

//   res.json({
//     clientSecret: paymentIntent.client_secret,
//   });
// });
server.get('/', (req,res)=>{
  res.send("backend hosted")
})

server.post('/create-payment-intent',  async (req, res) => {
  try {
    console.log(req , "req in payment")
    // Verify the order belongs to the authenticated user
    const order = await Order.findOne({
      _id: req.body.orderId,
      user: req.user.id
    });
    
    if (!order) {
      return res.status(403).json({ error: 'Unauthorized access to order' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(req.body.totalAmount * 100),
       currency: 'pkr',
      payment_method_types: ['card'],
      metadata: {
        orderId: req.body.orderId,
        userId: req.user.id.toString()
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
});
// main().catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect(process.env.MONGODB_URL);
//   console.log('database connected');
// }

// Remove the existing main() function and replace with:
console.log('Connecting with URL:', 
  process.env.MONGODB_URL);
connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  });

// server.listen(process.env.PORT, () => {
//   console.log('server started');
// });

