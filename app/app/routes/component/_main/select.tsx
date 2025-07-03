export default function Select(props: {list: number[]}){
  return (
    <>
      <select name="selected-num">
        <option value={undefined} />
        {props.list.map((num)=> <option>&nbsp;&nbsp;{num}</option>)}
      </select>
      &nbsp;
      &nbsp;
      &nbsp;
      &nbsp;
      &nbsp;
      &nbsp;
    </>
  )
}