import { Input } from "@/components/ui"

export default function ComponentB() {
  return (
    <div>
      <label htmlFor="name">Name:</label>
      <Input id="name" placeholder="Enter your name" />
    </div>
  )
}