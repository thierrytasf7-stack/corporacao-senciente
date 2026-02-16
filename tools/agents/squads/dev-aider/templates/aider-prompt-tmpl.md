# Aider Prompt Template

**Template for optimized prompts for Arcee Trinity 127B (4k context)**

Use this template to structure prompts that work best with limited context windows.

---

## Template Structure

### Section 1: Task Definition

```
TASK:
[One-sentence description of what to implement]

CONTEXT:
[2-3 sentences explaining why this is needed]
```

### Section 2: Requirements

```
REQUIREMENTS:
1. [Specific requirement with details]
2. [Another requirement]
3. [Add error handling requirement]
4. [Add testing requirement]
```

### Section 3: Code Pattern

```
PATTERN TO FOLLOW:
[Reference existing code that demonstrates the pattern]
See [filename] lines [X-Y] for the pattern:
  - [Pattern element 1]
  - [Pattern element 2]
  - [Pattern element 3]
```

### Section 4: Specific Implementation Details

```
SPECIFIC DETAILS:
- Function signature: [exact signature needed]
- Input type: [what input receives]
- Output type: [what should return]
- Error handling: [how to handle errors]
- Validation: [what to validate]
```

### Section 5: Success Criteria

```
SUCCESS CRITERIA:
✓ [Checkable criterion 1]
✓ [Checkable criterion 2]
✓ [Checkable criterion 3]
✓ Code follows existing patterns
✓ No console errors
✓ Tests pass (if applicable)
```

---

## Template Examples

### Example 1: Simple API Endpoint

```
TASK:
Implement POST /api/users endpoint for creating new users.

CONTEXT:
The user management system needs ability to create users via REST API.
This endpoint will be called by the frontend registration form.

REQUIREMENTS:
1. Accept JSON body: {name: string, email: string, password: string}
2. Validate email format using regex: /^[^@]+@[^@]+\.[^@]+$/
3. Validate password strength: min 8 chars, uppercase, lowercase, number
4. Hash password before saving (use bcrypt or similar)
5. Check email is not already registered, throw 409 if duplicate
6. Create user in database with createdAt timestamp
7. Return created user: {id, name, email, createdAt} (NO password!)
8. Handle errors and return proper HTTP status codes

PATTERN TO FOLLOW:
See src/api/auth/register.js lines 15-50:
  - Validate input first
  - Check duplicates
  - Hash sensitive data
  - Return cleaned response

SPECIFIC DETAILS:
- Function signature: async function createUser(req, res)
- Database method: await db.users.create({name, email, password_hash, createdAt})
- Error responses:
  - 400: Invalid input (validation failed)
  - 409: Duplicate email
  - 500: Database error
- Log: logger.info('User created', {userId: user.id, email})

SUCCESS CRITERIA:
✓ Validates email format
✓ Validates password strength
✓ Prevents duplicate emails
✓ Returns user without password
✓ Returns proper HTTP status codes
✓ Logs creation event
✓ Follows existing REST API pattern
```

### Example 2: Refactoring Task

```
TASK:
Refactor auth module to use async/await instead of Promise .then() chains.

CONTEXT:
The authentication module uses promise chains from legacy code.
Refactoring to async/await makes code more readable and maintainable.

REQUIREMENTS:
1. Convert all .then() chains to async/await
2. Keep all existing error handling
3. Maintain same function signatures
4. All tests must still pass

PATTERN TO FOLLOW:
Convert this pattern:
❌ user.findById(id)
    .then(user => validate(user))
    .then(user => returnUser(user))
    .catch(err => handleError(err))

To this pattern:
✓ async function getUser(id) {
    try {
      const user = await user.findById(id);
      validate(user);
      return user;
    } catch (err) {
      handleError(err);
    }
  }

SPECIFIC DETAILS:
- Convert functions: authenticateUser, validateToken, refreshToken
- File location: src/auth.js
- Keep error handling identical

SUCCESS CRITERIA:
✓ All .then() converted to async/await
✓ All existing tests pass
✓ Error handling preserved
✓ Code more readable
```

### Example 3: Documentation Task

```
TASK:
Write JSDoc comments for authentication service functions.

CONTEXT:
The authentication service has helpful functions but lacks documentation.
Adding JSDoc will make API clear for other developers.

REQUIREMENTS:
1. Add JSDoc to functions: login, logout, validateToken, refreshToken
2. Include @param descriptions
3. Include @returns description
4. Include @throws for error conditions
5. Add usage examples where helpful

PATTERN TO FOLLOW:
See src/database.js lines 10-25 for JSDoc style:
  /**
   * [Description]
   *
   * @param {Type} paramName - [Description]
   * @returns {Type} [Description]
   * @throws {ErrorType} When [condition]
   *
   * @example
   * [usage example]
   */

SPECIFIC DETAILS:
- File: src/auth/authService.js
- Format: JSDoc 3.0
- Include examples for complex functions

SUCCESS CRITERIA:
✓ All functions have JSDoc
✓ @param documented for all parameters
✓ @returns documented
✓ @throws documented for error cases
✓ Examples provided for complex functions
✓ Follows existing JSDoc style in codebase
```

---

## Best Practices for Aider Prompts

### DO ✓

- ✓ Be specific and concrete
- ✓ Reference existing code (lines numbers)
- ✓ Provide examples of desired output
- ✓ List success criteria that are checkable
- ✓ Keep total prompt under 2000 characters
- ✓ Mention specific patterns to follow
- ✓ Include error handling requirements

### DON'T ✗

- ✗ Be vague ("make it better")
- ✗ Ask for everything at once (one change per session)
- ✗ Omit error handling
- ✗ Forget to reference patterns
- ✗ Make prompts longer than context allows
- ✗ Skip testing requirements
- ✗ Assume knowledge of codebase conventions

---

## Real-World Optimization

### Before Optimization ❌

```
Please implement a function to handle user login. It should check the database,
validate passwords, and return a token. Follow the existing patterns in the codebase.
Handle errors appropriately. Make sure it's secure.
```

**Problems:**
- Vague about implementation details
- No specific pattern reference
- No error handling specifics
- No success criteria

### After Optimization ✓

```
TASK:
Implement POST /api/auth/login endpoint.

REQUIREMENTS:
1. Accept JSON: {email, password}
2. Query database: const user = await db.users.findByEmail(email)
3. Validate password: await bcrypt.compare(password, user.password_hash)
4. Generate JWT: const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET)
5. Return: {token, user: {id, email, name}}
6. Errors: 401 if email not found, 401 if password wrong, 500 on server error

PATTERN:
Follow src/api/auth/register.js lines 20-45 structure

SPECIFIC:
- Database method: db.users.findByEmail(email)
- Hash validation: bcrypt.compare(password, hash)
- Token generation: jwt.sign({userId}, secret)
- Error responses: throw new ApiError(code, message)

SUCCESS CRITERIA:
✓ Validates email exists
✓ Validates password correct
✓ Generates JWT token
✓ Returns proper errors
✓ Logs login attempt
✓ Tests pass (10/10)
```

**Improvements:**
- Specific functions and methods
- Exact error codes
- Clear pattern reference
- Measurable success criteria
- Database method name provided

---

## Quick Template (Minimal Version)

For simple, clear tasks:

```
TASK: [One sentence]

IMPLEMENTATION:
[Specific code requirements, line numbers]

PATTERN: [Reference to existing code]

SUCCESS: [2-3 checkable criteria]
```

---

## Advanced: Multi-Step Prompt Strategy

For complex tasks that need multiple sessions:

### Round 1: Foundation
```
TASK: Implement database layer

STEP 1: Create connection pool
REQUIREMENTS:
  - File: src/db/connection.js
  - Use existing config in src/config/database.js
  - Export: function getConnection()

SUCCESS:
  ✓ Connection pool created
  ✓ Config loaded properly
  ✓ Exports correct function
```

### Round 2: Queries
```
TASK: Add user queries

STEP 2: Implement user queries
REQUIREMENTS:
  - File: src/db/queries/user.js
  - Implement: findById, findByEmail, create, update
  - Use connection from step 1
  - Follow pattern in src/db/queries/product.js
```

### Round 3: Testing
```
TASK: Write tests

STEP 3: Unit tests
REQUIREMENTS:
  - File: tests/db/user.test.js
  - Test all 4 query functions
  - Mock database connection
  - Follow pattern in tests/db/product.test.js
```

---

## Common Pitfalls to Avoid

### Pitfall 1: Too Long

❌ Prompt over 2000 characters causes context limits

✓ Keep under 1800 characters, use reference instead

### Pitfall 2: Too Vague

❌ "Implement the feature"

✓ "Implement POST /api/products with fields: name, price, category. Validate: name required, price > 0, category from enum."

### Pitfall 3: Missing Patterns

❌ No reference to similar code

✓ "Follow error handling pattern in src/api/middleware/error.js lines 10-30"

### Pitfall 4: No Error Handling

❌ No mention of what happens when things fail

✓ "Errors: 404 if not found, 400 if validation fails, 500 on server error"

### Pitfall 5: Too Many Changes

❌ "Refactor auth, add tests, optimize db, fix linting"

✓ "Round 1: Refactor to async/await only"

---

## Testing Your Prompt

Before sending to Aider, ask:

1. **Specific?** Can someone implement exactly what I described?
2. **Pattern clear?** Did I reference existing code?
3. **Complete?** Are all requirements covered?
4. **Success criteria?** Can I verify it worked?
5. **Length ok?** Is it under 2000 chars?
6. **One task?** Am I asking for one logical change?

If all YES → Ready for Aider! ✓
