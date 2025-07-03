export default function List (props: {list: number[]}) {
  return (
    <ul style={{listStyle: "none", paddingInlineStart: "0px"}}>
      {props.list.map((num) => {return <li>{ num }</li>})}
    </ul>
  )
}