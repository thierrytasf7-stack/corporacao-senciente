# Data Flow Checklist

## CRUD Operations
- [ ] CREATE: form submit -> backend persist -> frontend confirm + update list
- [ ] READ: frontend request -> backend return -> frontend render all fields
- [ ] UPDATE: frontend edit -> backend update -> frontend reflect changes
- [ ] DELETE: frontend action -> confirm dialog -> backend delete -> frontend remove item

## List Operations
- [ ] Pagination params alinham (page/offset, limit/perPage)
- [ ] Sort params alinham (sortBy, order)
- [ ] Filter/search params alinham
- [ ] Backend retorna total count para pagination

## Post-Mutation Updates
- [ ] Lista atualiza apos CREATE
- [ ] Item atualiza apos UPDATE
- [ ] Item removido da lista apos DELETE
- [ ] Cache invalidado corretamente

## Upload/Download
- [ ] File upload chega ao backend corretamente (multipart)
- [ ] Progress indicator durante upload
- [ ] Download URLs funcionais
