class ComputeService{

    static ComputePnl(sell: number ,buy: number, potion: number){
        return (sell - buy) * potion
    }

}

export default ComputeService