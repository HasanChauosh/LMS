# purchaseCourses Function - Line by Line Explanation

This is a backend controller function that handles the course purchase process using Stripe payment gateway.

## Function Signature
```javascript
export const purchaseCourses = async(req,res)=>{
```
- **`export`**: Makes the function available for import in other files (routes)
- **`async`**: Indicates this is an asynchronous function that uses `await`
- **`req, res`**: Express request and response objects

---

## Step 1: Extract Data from Request
```javascript
const {courseId} =req.params;
```
- Extracts `courseId` from URL parameters (e.g., `/api/purchase/:courseId`)

```javascript
const {origin} = req.headers;
```
- Gets the `origin` header to construct Stripe callback URLs (e.g., `http://localhost:3000`)

```javascript
const userId = req.auth.userId;
```
- Retrieves authenticated user's ID from the auth middleware (attached to `req.auth`)

---

## Step 2: Fetch User and Course Data
```javascript
const userData= await User.findById(userId);
```
- Queries the User collection to get the user's document from MongoDB

```javascript
const courseData= await Course.findById(courseId);
```
- Queries the Course collection to get the course's document from MongoDB

---

## Step 3: Validate Existence
```javascript
if(!courseData || !userData){
    return res.status(401).json({success:false,message:"Unauthorized"})
}
```
- **If either user or course doesn't exist**: Returns 401 Unauthorized status
- This prevents purchases with invalid user IDs or course IDs

---

## ⚠️ BUG FOUND: Incorrect Field Name
```javascript
// CURRENT CODE (WRONG - Bug!):
amount:courseData.price-(courseData.price* (courseData.discount/100)).toFixed(2),

// CORRECT CODE SHOULD BE:
amount:courseData.coursePrice-(courseData.coursePrice* (courseData.discount/100)).toFixed(2),
```

### Issue Explanation:
The Course schema defines the field as **`coursePrice`**:
```javascript
coursePrice:{type :Number , required : true},
```

But the controller code incorrectly uses **`price`** instead:
```javascript
courseData.price  // ❌ WRONG - this will be undefined!
courseData.coursePrice  // ✅ CORRECT - matches schema
```

### Impact:
- `courseData.price` will be **`undefined`**
- Math operation: `undefined - undefined = NaN`
- This will cause the Stripe checkout to fail with invalid amount

---

## Step 4: Calculate Purchase Amount (CORRECTED)
```javascript
const purchaseData  = {
    courseId:courseData._id,
    userId:userData._id,
    amount:courseData.coursePrice-(courseData.coursePrice* (courseData.discount/100)).toFixed(2),
}
```
- **`courseId`**: MongoDB ObjectId of the course
- **`userId`**: MongoDB ObjectId of the user
- **`amount`**: Final price after discount calculation:
  - `courseData.coursePrice * (courseData.discount/100)` = Discount amount
  - `courseData.coursePrice - discount` = Final price
  - `.toFixed(2)` = Ensures 2 decimal places for currency

---

## Step 5: Create Purchase Record
```javascript
const newPurchase =  await Purchase.create(purchaseData);
```
- Creates a new document in the Purchase collection
- Stores the purchase transaction record in MongoDB
- Returns the created purchase object with `_id`

---

## Step 6: Initialize Stripe
```javascript
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
```
- Creates a new Stripe instance using the secret key from environment variables
- This key is used to authenticate with Stripe's API

```javascript
const currency = process.env.CURRENCY.toLowerCase();
```
- Gets the currency code (e.g., "USD") from environment
- Converts to lowercase as Stripe requires lowercase currency codes

---

## Step 7: Create Line Items for Stripe
```javascript
const line_items=[{
    price_data:{
        currency,
        product_data:{
            name:course        },
        unitData.courseTitle
_amount: Math.floor(newPurchase.amount * 100),
    },
    quantity:1,
}]
```
- **`currency`**: Payment currency (e.g., "usd")
- **`product_data.name`**: Course title displayed on Stripe checkout
- **`unit_amount`**: Amount in cents (Stripe requires amounts in smallest currency unit)
  - `$10.00 → 1000 cents`
  - `Math.floor()` ensures whole number
- **`quantity`**: Number of items (always 1 for courses)

---

## Step 8: Create Stripe Checkout Session
```javascript
const session = await stripeInstance.checkout.sessions.create({
    success_url: `${origin}/loading/my-enrollments`,
    cancle_url: `${origin}/`,
    line_items:line_items,
    mode:'payment',
    metadata:{
        purchaseId:newPurchase._id.toString(),
    }
})
```
- **`success_url`**: Where to redirect after successful payment
- **`cancle_url`**: Where to redirect if user cancels payment
- **`line_items`**: Products being purchased (created in Step 7)
- **`mode`**: Set for one-time payments to 'payment'
- **`metadata.purchaseId`**: Custom field to link Stripe transaction to our Purchase record

---

## Step 9: Return Session URL to Client
```javascript
res.json({success:true,session_url:session.url})
```
- Returns a JSON response with:
  - **`success`**: true
  - **`session_url`**: The Stripe checkout page URL
- Frontend redirects user to this URL to complete payment

---

## Error Handling
```javascript
} catch (error) {
    console.error('purchaseCourses error:', error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
}
```
- Catches any errors during the purchase process
- Logs the error to console for debugging
- Returns 500 Internal Server Error with error message

---

## Complete Flow Diagram
```
1. User clicks "Buy Course"
   ↓
2. Frontend calls /api/purchase/:courseId
   ↓
3. Backend extracts courseId & userId
   ↓
4. Fetch user & course data from MongoDB
   ↓
5. Validate both exist
   ↓
6. Calculate final price (after discount)
   ↓
7. Create Purchase record in database
   ↓
8. Create Stripe checkout session
   ↓
9. Return session URL to frontend
   ↓
10. Frontend redirects to Stripe checkout
   ↓
11. User completes payment on Stripe
   ↓
12. Stripe redirects to success_url
```

---

## Environment Variables Required
```env
STRIPE_SECRET_KEY=sk_test_...
CURRENCY=USD
```

---

## Stripe Webhooks (Not in this function)
After payment completion, Stripe sends a webhook to your server to:
- Verify payment was successful
- Update purchase status
- Grant course access to user

