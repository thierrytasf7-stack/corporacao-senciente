import { useState } from "react"
import { Button, Text } from "@/components/ui"

export default function ComponentA() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
  }

  return (
    <div>
      <Button onClick={handleClick}>Click me</Button>
      <Text>Count: {count}</Text>
    </div>
  )
}