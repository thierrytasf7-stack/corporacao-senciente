import { useState } from "react"
import { Checkbox } from "@/components/ui"

export default function ComponentC() {
  const [isChecked, setIsChecked] = useState(false)

  const handleChange = (checked: boolean) => {
    setIsChecked(checked)
  }

  return (
    <div>
      <Checkbox 
        checked={isChecked}
        onCheckedChange={handleChange}
      >
        Agree to terms
      </Checkbox>
    </div>
  )
}