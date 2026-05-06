# Admin User Update - Quick Reference

## How to Update User Data

### 1. Access Admin Panel
- Navigate to `/admin/users`
- Find the user you want to update

### 2. Click Edit Button
- Click the **pencil icon** (Edit) next to the user
- Edit User Profile modal will open

### 3. Update Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Balance ($)** | User's cash balance | 4000 |
| **Total Profit ($)** | User's profit/loss (use + or -) | 70 or -50 |
| **Holdings** | Number of assets user owns | 30 |
| **Portfolio Value ($)** | Total portfolio worth | 90 |

### 4. Save Changes
- Click **"Save Changes"** button
- Success message appears: "✅ User profile updated! Changes will appear on user dashboard within 5 seconds."

### 5. Verify
- User will see changes on their dashboard within **5 seconds**
- No action required from user
- Auto-refresh happens automatically

## What User Sees

After admin update, user's dashboard will show:

```
┌─────────────────────────────────────────────────┐
│  TOTAL BALANCE        PORTFOLIO P/L             │
│  $4,000.00           +$70.00                    │
│                                                  │
│  HOLDINGS            TOTAL PROFIT               │
│  30                  +$70.00                    │
└─────────────────────────────────────────────────┘
```

## Important Notes

✅ **Changes are automatic** - User doesn't need to refresh
✅ **5-second sync** - Updates appear within 5 seconds
✅ **Admin values override** - Your values take priority over calculated values
✅ **Persistent** - Values remain until you change them again

## Tips

- **Positive profit**: Enter as positive number (e.g., 70)
- **Loss**: Enter as negative number (e.g., -50)
- **Zero values**: Enter 0 to reset
- **Decimal values**: Use decimals for cents (e.g., 4000.50)

## Troubleshooting

**User not seeing changes?**
- Wait 5 seconds for auto-refresh
- Ask user to click "Refresh Now" button
- Check that you clicked "Save Changes"

**Values showing incorrectly?**
- Ensure you entered valid numbers
- Check for typos
- Verify decimal format (use . not ,)
